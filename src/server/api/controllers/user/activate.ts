import { Request, Response, NextFunction } from 'express';
import { ServerError } from '../../../utils/custom.errors';
import sql from 'mssql';

export default async (req: Request, res: Response, next: NextFunction) => {
  const activationToken = req.params.token;
  const db = req.app.locals.db;
  const redis = req.app.locals.redis;
  try {
    const userId = await redis.get(`user:activation:${activationToken}`);

    if (userId) {
      await db
        .request()
        .input('user_id', sql.UniqueIdentifier, userId)
        .execute('api.activate_user');

      res.redirect('/login.html');
    } else {
      throw new ServerError(50100);
    }
  } catch (error) {
    next(error);
  }
};
