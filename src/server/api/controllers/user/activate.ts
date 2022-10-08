import { redisClientPromise } from '../../../index';
import sql from 'mssql';

export default async (req, res, next) => {
  const activationToken = req.params.token;
  res.send(200);
};
