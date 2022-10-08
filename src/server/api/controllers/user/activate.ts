import { redisClientPromise, dbPoolPromise } from '../../../index';
import { ServerError } from '../../../utils/custom.errors';
import sql from 'mssql';

export default async (req, res, next) => {
  const activationToken = req.params.token;
  try {
    const redisClient = await redisClientPromise;
    const userId = await redisClient.get(`user:activation:${activationToken}`);

    if (userId) {
      const dbPool = await dbPoolPromise;
      await dbPool
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
