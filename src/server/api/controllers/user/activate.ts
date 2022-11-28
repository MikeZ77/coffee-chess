import { Request, Response, NextFunction } from 'express';
import { ServerError } from '../../../utils/custom.errors';
import sql, { ConnectionPool } from 'mssql';
import { RedisClientType } from 'redis';

export default async (req: Request, res: Response, next: NextFunction) => {
  const db: ConnectionPool = req.app.locals.db;
  const redis: RedisClientType = req.app.locals.redis;
  const activationToken = req.params.token;

  try {
    const userId = await redis.get(`user:activation:${activationToken}`);

    if (userId) {
      await db
        .request()
        .input('user_id', sql.UniqueIdentifier, userId)
        .execute('api.activate_user');

      res.redirect('/login');
    } else {
      throw new ServerError(50100);
    }
  } catch (error) {
    next(error);
  }
};
