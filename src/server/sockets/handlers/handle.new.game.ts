import type { Server as ioServer } from 'socket.io';
import type { RedisClientType } from 'redis';
import type { QueueRecord, UserState } from '@Types';
import { v4 as uuidv4 } from 'uuid';
import Logger from '@Utils/config.logging.winston';

const { GAME_OBJECT_EXPIRY_SECONDS } = process.env;

export default (
  io: ioServer,
  redis: RedisClientType,
  redisSubscriber: RedisClientType
): void => {
  /*
      Initializes a game on the server and messages the client to initialize a game:
      1. Check if the matched user is in state DISCONNECTED.
      2. If True then move any connected players back to the queue.
      3. If OK create the game instance.
      4. Send an INIT_GAME message to room game:match.
  */
  redisSubscriber.subscribe('channel:game:new', async (message) => {
    try {
      const matchedGame: QueueRecord[] = JSON.parse(message);
      const [seekingPlayer, matchedPlayer] = matchedGame;
      const timeControl = seekingPlayer.type;
      const gameQueue = `game:queue:${timeControl}`;
      const userSessionSeekingPlayer = `user:session:${seekingPlayer.userId}`;
      const userSessionMatchedPlayer = `user:session:${matchedPlayer.userId}`;
      let white, black, clockTime;

      /* 
        Note: We dont really care about race conditions here. If a user is currently searching
        the queue and misses this record thats fine. This gets the user requeued as fast as possible
        without locking.
      */
      const matchedPlayerState = <UserState>await redis.json.get(userSessionMatchedPlayer, {
        path: ['state']
      });
      if (matchedPlayerState === 'DISCONNECTED') {
        await redis.lPush(gameQueue, JSON.stringify(seekingPlayer));
      }

      Math.random() < 0.5
        ? ((white = seekingPlayer), (black = matchedPlayer))
        : ((white = matchedPlayer), (black = seekingPlayer));

      switch (timeControl) {
        case '1+0':
          clockTime = '1:00:00';
          break;
        case '5+0':
          clockTime = '5:00:00';
          break;
        case '15+0':
          clockTime = '15:00:00';
          break;
      }
      const gameId = uuidv4();
      const newGame = {
        gameId: gameId,
        userWhite: white.username,
        userWhiteId: white.userId,
        ratingWhite: white.rating,
        userBlack: black.username,
        userBlackId: black.userId,
        ratingBlack: black.rating,
        watching: [],
        type: timeControl,
        whiteTime: clockTime,
        blackTime: clockTime,
        state: 'PENDING',
        position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
        gameChat: [],
        result: null,
        startTime: null
      };
      await redis
        .multi()
        .json.set(`game:${newGame.gameId}`, '$', newGame)
        .expire(`game:${newGame.gameId}`, parseInt(GAME_OBJECT_EXPIRY_SECONDS))
        .json.set(userSessionSeekingPlayer, '$.playingGame', newGame.gameId)
        .json.set(userSessionMatchedPlayer, '$.playingGame', newGame.gameId)
        .exec();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userWhiteId, userBlackId, ...rest } = newGame;
      await io.emit('message:game:match', rest);
      Logger.info('Paired: %o', matchedGame);
    } catch (error) {
      if (error instanceof Error) {
        /* TODO: If there is an unexpected error, we need to attempt to rollbacck the game creation
         so the user is not left in a bad state. Call this from Manager.*/
        Logger.error(`${error.message}: %o`, error.stack);
      }
    }
  });
};
