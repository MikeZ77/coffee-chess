import type { Request, Response } from 'express';
import { type ConnectionPool } from 'mssql';
import type { RedisClientType } from 'redis';

export default (req: Request, res: Response) => {
  const db: ConnectionPool = req.app.locals.db;
  const redis: RedisClientType = req.app.locals.redis;

  const dbHealthy = db.connected;
  const redisHealthy = redis.isReady;
  const health = dbHealthy && redisHealthy;
  const dependencyHealth = { status: health, database: dbHealthy, cache: redisHealthy };
  res.status(health ? 200 : 503).json(dependencyHealth);
};
