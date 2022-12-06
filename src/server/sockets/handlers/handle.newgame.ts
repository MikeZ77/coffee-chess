import type { Server as ioServer } from 'socket.io';
import type { RedisClientType } from 'redis';
import type { Redis } from 'ioredis';
import type { QueueRecord, UserStates } from '@Types';
import RedLock from 'redlock';
import { v4 as uuidv4 } from 'uuid';
import Logger from '@Utils/config.logging.winston';

const { QUEUE_LOCK_TTL } = process.env;

export default (
  io: ioServer,
  redis: RedisClientType,
  redisSubscriber: RedisClientType,
  ioredis: Redis
): void => {
  /*
      Initializes a game on the server and messages the client to initialize a game:
      1. Check if either client is in state DISCONNECT.
      2. If True then move any connected players back to the queue.
      3. If OK create the game instance.
      4. Send an INIT_GAME message to room game:match.
  */
  redisSubscriber.subscribe('channel:game:new', async (message) => {
    try {
      const lockTTL = parseInt(QUEUE_LOCK_TTL);
      const redlock = new RedLock([ioredis]);
      const matchedGame: QueueRecord[] = JSON.parse(message);
      const [seekingPlayer, matchedPlayer] = matchedGame;
      const timeControl = seekingPlayer.type;
      const gameQueue = `game:queue:${timeControl}`;
      const userSessionSeekingPlayer = `user:session:${seekingPlayer.userId}`;
      const userSessionMatchedPlayer = `user:session:${matchedPlayer.userId}`;
      let player, white, black, clockTime;

      const [seekingPlayerState, matchedPlayerState] = <[UserStates, UserStates]>(
        await Promise.all([
          redis.json.get(userSessionSeekingPlayer, { path: ['state'] }),
          redis.json.get(userSessionMatchedPlayer, { path: ['state'] })
        ])
      );

      if (seekingPlayerState === 'DISCONNECTED' && matchedPlayerState === 'DISCONNECTED') {
        return;
      } else if (seekingPlayerState === 'DISCONNECTED') {
        if (['SEARCHING', 'SEARCHING_OBSERVING'].includes(matchedPlayerState)) {
          player = matchedPlayer;
        }
      } else if (matchedPlayerState === 'DISCONNECTED') {
        if (['SEARCHING', 'SEARCHING_OBSERVING'].includes(seekingPlayerState)) {
          player = seekingPlayer;
        }
      }
      if (player) {
        const lock = await redlock.acquire([`lock:${gameQueue}`], lockTTL);
        try {
          await redis.rPush(gameQueue, JSON.stringify(player));
        } finally {
          await lock.release();
        }
        return;
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
        userBlack: black.username,
        userBlackId: black.userId,
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
        .json.set(userSessionSeekingPlayer, '$.playingGame', newGame.gameId)
        .json.set(userSessionMatchedPlayer, '$.playingGame', newGame.gameId)
        .exec();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userWhiteId, userBlackId, ...rest } = newGame;
      await io.emit('message:game:match', rest);
    } catch (error) {
      Logger.error(error);
    }
  });
};
