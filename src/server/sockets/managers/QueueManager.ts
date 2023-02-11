import type { RedisClientType } from 'redis';
import type { Server as ioServer } from 'socket.io';
import type { QueueRecord, UserState } from '@Types';
import { Chess } from 'chess.js';
import { v4 as uuidv4 } from 'uuid';
import Logger from '@Utils/config.logging.winston';

const { GAME_OBJECT_EXPIRY_SEC, GAME_MATCH_QUEUE_BLOCK_SEC: blockSeconds } = process.env;

export default class QueueManager {
  public listenMatchQueue = async () => {
    /* 
       Blocks the *connection* for blockSeconds or until there is an element to pop.
       If multiple instances are blocked on the same *key* (game:queue:match) then 
       the first one served will be the one that is waiting the longest. Setting
       the timeout (blockSeconds) is best practice so that the socket/connection
       does not timeout.  
    */
    while (true!) {
      const item = await this.queueRedis.blPop('game:queue:match', parseInt(blockSeconds));
      if (item) {
        const matchedGame: QueueRecord[] = JSON.parse(item.element);
        try {
          this.handleNewGame(matchedGame);
        } catch (error) {
          if (error instanceof Error) {
            Logger.error(`${error.message}: %o`, error.stack);
            const [{ userId: seekingUserId }, { userId: matchedUserId }] = matchedGame;
            const [seekingPlayerState, matchedPlayerState] = await Promise.all([
              this.redis.json.get(`user:session:${seekingUserId}`),
              this.redis.json.get(`user:session:${matchedUserId}`)
            ]);
            Logger.info(`userstate: %o`, seekingPlayerState);
            Logger.info(`userstate: %o`, matchedPlayerState);
          }
        }
      }
    }
  };

  private handleNewGame = async (matchedGame: QueueRecord[]) => {
    const [seekingPlayer, matchedPlayer] = matchedGame;
    const timeControl = seekingPlayer.type;
    const gameQueue = `game:queue:${timeControl}`;
    const userSessionSeekingPlayer = `user:session:${seekingPlayer.userId}`;
    const userSessionMatchedPlayer = `user:session:${matchedPlayer.userId}`;
    const chess = new Chess();
    let white, black, clockTime;

    /* 
      Note: We dont really care about race conditions here. If a user is currently searching
      the queue and misses this record thats fine. This gets the user requeued as fast as possible
      without locking.
    */
    const matchedPlayerState = <UserState>await this.redis.json.get(userSessionMatchedPlayer, {
      path: ['state']
    });
    // The opponent may be DISCONNECTED or IDLE if some error happened.
    Logger.debug('Player state %o', matchedPlayerState);
    if (!['SEARCHING', 'SEARCHING_OBSERVING'].includes(matchedPlayerState)) {
      await this.redis.lPush(gameQueue, JSON.stringify(seekingPlayer));
      return;
    }
    //TODO: If state SEARCHING_OBSERVING, remove the player from that room.

    Math.random() < 0.5
      ? ((white = seekingPlayer), (black = matchedPlayer))
      : ((white = matchedPlayer), (black = seekingPlayer));

    switch (timeControl) {
      case '1+0':
        clockTime = 60000;
        break;
      case '5+0':
        clockTime = 300000;
        break;
      case '15+0':
        clockTime = 900000;
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
      position: chess.fen(),
      pendingDrawOfferFrom: null,
      history: [],
      gameChat: [],
      result: null,
      startTime: null
    };
    await this.redis
      .multi()
      .json.set(`game:${newGame.gameId}`, '$', newGame)
      .expire(`game:${newGame.gameId}`, parseInt(GAME_OBJECT_EXPIRY_SEC))
      .json.set(userSessionSeekingPlayer, '$.playingGame', newGame.gameId)
      .json.set(userSessionMatchedPlayer, '$.playingGame', newGame.gameId)
      .exec();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userWhiteId, userBlackId, ...rest } = newGame;
    await this.io.emit('message:game:match', rest);
    Logger.info('Paired game: %o', matchedGame);
  };

  private io;
  private redis;
  private queueRedis;
  constructor(io: ioServer, redis: RedisClientType, queueRedis: RedisClientType) {
    this.io = io;
    this.redis = redis;
    this.queueRedis = queueRedis;
  }
}
