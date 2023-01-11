import type { Request, Response, NextFunction } from 'express';
import type { RedisClientType } from 'redis';

export default async (req: Request, res: Response, next: NextFunction) => {
  const redis: RedisClientType = req.app.locals.redis;
  try {
    const userId = req.id;
    await redis.json.del(`user:session:${userId}`);
    res.clearCookie('access_token');
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};
