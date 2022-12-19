import type { Request, Response, NextFunction } from 'express';
import type { RedisClientType } from 'redis';
import type { TimeControl } from '@Types';
import RedLock from 'redlock';

const { QUEUE_LOCK_TTL_MS } = process.env;

export default async (req: Request, res: Response, next: NextFunction) => {
  /*
      Removes a player from searching one of the game queues.
  */
  const redis: RedisClientType = req.app.locals.redis;
  const ioredis = req.app.locals.ioredis;
  const userId = req.id;

  const redlock = new RedLock([ioredis]);
  const timeControl = <TimeControl>req.params.minutes;
  const gameQueue = `game:queue:${timeControl}`;
  const userSesison = `user:session:${userId}`;
  const lockTTL = parseInt(QUEUE_LOCK_TTL_MS);

  try {
    const lock = await redlock.acquire([`lock:${gameQueue}`], lockTTL);
    try {
      const state = <string>await redis.json.get(userSesison, {
        path: ['state']
      });
      const games = await redis.lRange(gameQueue, 0, -1);
      for (const game of games) {
        if (game !== 'DUMMY') {
          const gameFetched = JSON.parse(game);
          if (userId === gameFetched.userId) {
            await redis.lRem(gameQueue, 1, game);
            break;
          }
        }
      }
      await redis.json.set(userSesison, 'state', state === 'SEARCHING' ? 'IDLE' : 'OBSERVING');
    } finally {
      await lock.release();
      res.status(200).send();
    }
  } catch (error) {
    next(error);
  }
};
