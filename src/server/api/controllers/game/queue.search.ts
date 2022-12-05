import type { Request, Response, NextFunction } from 'express';
import type { RedisClientType } from 'redis';
import type { UserSession, QueueRecord, TimeControl } from '@Types';
import sql, { type ConnectionPool } from 'mssql';
import { ServerError } from '../../../utils/custom.errors';
import { DateTime } from 'luxon';
import RedLock from 'redlock';
import Logger from '@Utils/config.logging.winston';

const { QUEUE_LOCK_TTL, QUEUE_RATING_MATCH } = process.env;

export default async (req: Request, res: Response, next: NextFunction) => {
  const db: ConnectionPool = req.app.locals.db;
  const redis: RedisClientType = req.app.locals.redis;
  const ioredis = req.app.locals.ioredis;

  const redlock = new RedLock([ioredis]);
  const timeControl = <TimeControl>req.params.minutes;
  const userId = req.id;
  const userSesison = `user:session:${userId}`;
  const gameQueue = `game:queue:${timeControl}`;
  const lockTTL = parseInt(QUEUE_LOCK_TTL);
  const ratingDiff = parseInt(QUEUE_RATING_MATCH);

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
    // TODO: Lock needs to come up to this point
    const { state, username } = <UserSession>await redis.json.get(userSesison, {
      path: ['state', 'username']
    });
    if (!rating || !state || !timeControl) {
      throw new ServerError(
        undefined,
        `endpoint:/game/search/${timeControl}, userId:${userId}, state:${state}, rating:${rating}`
      );
    }

    switch (state) {
      case 'OBSERVING':
      case 'IDLE': {
        const queueNewGame: QueueRecord = {
          userId: userId,
          username: username,
          type: timeControl,
          rating: rating,
          searchStart: DateTime.utc().toString()
        };
        let gameMatch;
        // Set player state to searching
        const lock = await redlock.acquire([`lock:${gameQueue}`], lockTTL);
        try {
          const queue = await redis.lRange(gameQueue, 0, -1);
          gameMatch = queue.find((gameType) => {
            if (gameType !== 'DUMMY') {
              const gameFetched = JSON.parse(gameType);
              const gameRating: number = gameFetched.rating;
              return rating <= gameRating + ratingDiff || rating >= gameRating - ratingDiff;
            }
          });
          if (gameMatch) {
            // Dequeue this player
            await redis
              .multi()
              .lRem(gameQueue, 1, gameMatch)
              .json.set(userSesison, '.state', 'SEARCHING')
              .exec();
          } else {
            // No match is found, so at the player to the queue.
            await redis
              .multi()
              .rPush(gameQueue, JSON.stringify(queueNewGame))
              .json.set(userSesison, '.state', 'SEARCHING')
              .exec();
          }
        } finally {
          await lock.release();
          if (gameMatch) {
            // Create game room and notify game start
            const pairing = JSON.stringify([queueNewGame, gameMatch]);
            await redis.publish('channel:game:new', pairing);
          }
        }
        break;
      }
      case 'PLAYING': {
        return res.status(400).send('Game in progress.');
      }
      case 'SEARCHING_OBSERVING':
      case 'SEARCHING': {
        return res.status(400).send('Cancel current game search.');
      }
      case 'DISCONNECTED': {
        Logger.warn(
          `User ${userId} in DISCONNECTED state searching /game/search/${timeControl} `
        );
        return res.status(400).send('Not connected to game server. Please try again later.');
      }
    }
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};
