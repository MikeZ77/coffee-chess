import type { Request, Response, NextFunction } from 'express';
import type { RedisClientType } from 'redis';
import type { UserStates } from '@Types';
import sql, { type ConnectionPool } from 'mssql';
import { ServerError } from '../../../utils/custom.errors';
import RedLock from 'redlock';
import Logger from '@Utils/config.logging.winston';

const { QUEUE_LOCK_TTL, QUEUE_RATING_MATCH } = process.env;

export default async (req: Request, res: Response, next: NextFunction) => {
  const db: ConnectionPool = req.app.locals.db;
  const redis: RedisClientType = req.app.locals.redis;
  // TODO: Note that if using a Redis cluster, we need to pass in a client for each node.
  // @ts-ignore
  const redlock = new RedLock(redis);
  const timeControl = req.params.minutes;
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
    const userState = <UserStates>await redis.json.get(userSesison, {
      path: ['state']
    });
    switch (userState) {
      case 'OBSERVING':
      case 'IDLE': {
        // Search queue
        // Set player state to searching

        const lock = await redlock.acquire(gameQueue, lockTTL);
        try {
          console.log(lock);
        } catch (error) {
          console.log(error);
        }

        // redlock.lock(gameQueue, lockTTL).then((lock) => {
        //   console.log(lock);
        //   // const queue = await redis.lRange(gameQueue, 0, -1);
        //   // queue.forEach((gameType, idx) => {
        //   //   console.log(idx, gameType);
        //   // });
        //   return lock.unlock().catch((error) => {
        //     Logger.error(error);
        //   });
        // });

        break;
      }
      case 'PLAYING': {
        return res.status(400).send('Game in progress.');
      }
      case 'SEARCHING': {
        return res.status(400).send('Cancel current game search.');
      }
      default: {
        if (userState === 'DISCONNECTED') {
          throw new ServerError(50104);
        } else {
          throw new ServerError(undefined, `Unknown state occured for user id: ${userId}`);
        }
      }
    }
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};
