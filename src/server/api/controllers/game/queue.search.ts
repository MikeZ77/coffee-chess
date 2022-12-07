import type { Request, Response, NextFunction } from 'express';
import type { RedisClientType } from 'redis';
import type { UserSession, QueueRecord, TimeControl } from '@Types';
import sql, { type ConnectionPool } from 'mssql';
import { DateTime } from 'luxon';
import RedLock from 'redlock';
import Logger from '@Utils/config.logging.winston';

const { QUEUE_LOCK_TTL_MS, QUEUE_RATING_MATCH } = process.env;

export default async (req: Request, res: Response, next: NextFunction) => {
  /*
      Adds a player to search one of the game type queues:
      1. Check if the player is in state OBSERVING or IDLE.
      2. Find a game match by rating difference.
      3. Updated matched players to state SEARCHING or SEARCHING_OBSERVING.
      4. Publish matched game to channel:game:new which is picked up by newgame.listener.
  */
  const db: ConnectionPool = req.app.locals.db;
  const redis: RedisClientType = req.app.locals.redis;
  const ioredis = req.app.locals.ioredis;

  const redlock = new RedLock([ioredis]);
  const timeControl = <TimeControl>req.params.minutes;
  const userId = req.id;
  const userSesison = `user:session:${userId}`;
  const gameQueue = `game:queue:${timeControl}`;
  const lockTTL = parseInt(QUEUE_LOCK_TTL_MS);
  const ratingDiff = parseInt(QUEUE_RATING_MATCH);
  let gameMatch, queueNewGame, errorMessage;

  try {
    const userTable = new sql.Table();
    userTable.columns.add('user_id', sql.UniqueIdentifier);
    userTable.columns.add('game_type', sql.NVarChar);
    userTable.rows.add(userId, timeControl);
    const result = await db
      .request()
      .input('users', userTable)
      .execute('api.get_user_ratings');
    const [record] = result.recordset;
    const { rating } = record;

    /* NOTE: We lock before getting the user state from UserSession.
             This is to avoid a possible race condition where they player
             simultanious searches two or more queues.
    */
    const lock = await redlock.acquire([`lock:${gameQueue}`], lockTTL);
    try {
      const { state, username } = <UserSession>await redis.json.get(userSesison, {
        path: ['state', 'username']
      });

      switch (state) {
        case 'OBSERVING':
        case 'IDLE':
          queueNewGame = <QueueRecord>{
            userId: userId,
            username: username,
            type: timeControl,
            rating: rating,
            searchStart: DateTime.utc().toString()
          };
          gameMatch = (await redis.lRange(gameQueue, 0, -1)).find((gameType) => {
            if (gameType !== 'DUMMY') {
              const gameFetched = JSON.parse(gameType);
              const gameRating: number = gameFetched.rating;
              return rating <= gameRating + ratingDiff || rating >= gameRating - ratingDiff;
            }
          });
          if (gameMatch) {
            await redis
              .multi()
              .lRem(gameQueue, 1, gameMatch)
              .json.set(
                userSesison,
                '.state',
                state === 'OBSERVING' ? 'SEARCHING_OBSERVING' : 'SEARCHING'
              )
              .exec();
          } else {
            await redis
              .multi()
              .rPush(gameQueue, JSON.stringify(queueNewGame))
              .json.set(
                userSesison,
                '.state',
                state === 'OBSERVING' ? 'SEARCHING_OBSERVING' : 'SEARCHING'
              )
              .exec();
          }
          break;
        case 'PLAYING':
          errorMessage = 'Game in progress.';
          break;
        case 'SEARCHING_OBSERVING':
        case 'SEARCHING':
          errorMessage = 'Cancel current game search.';
          break;
        case 'DISCONNECTED':
          Logger.warn(
            `User ${userId} in DISCONNECTED state searching /game/search/${timeControl} `
          );
          errorMessage = 'Not connected to game server. Please try again later.';
      }
    } finally {
      await lock.release();
    }
    if (gameMatch) {
      // Create game room and notify game start
      const pairing = JSON.stringify([queueNewGame, JSON.parse(gameMatch)]);
      await redis.publish('channel:game:new', pairing);
    }
    return errorMessage
      ? res.status(400).json({ message: errorMessage })
      : res.status(200).send();
  } catch (error) {
    next(error);
  }
};
