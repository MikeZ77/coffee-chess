import { createClient } from 'redis';
import Redis from 'ioredis';
import Logger from './config.logging.winston';

type RedisClient = ReturnType<typeof createClient>;
type IORedisClient = ReturnType<typeof Redis>;

const { REDIS_SERVER, IO_REDIS_SERVER } = process.env;

export const redisConfig = {
  url: REDIS_SERVER
};

export const initConnListeners = (
  conn: RedisClient | IORedisClient,
  connectionType: string
) => {
  conn.on('ready', () => {
    Logger.info(`${connectionType} connection status: ready`);
  });
  conn.on('reconnecting', () => {
    Logger.warn(`${connectionType} connection status: reconnecting`);
  });
  conn.on('error', (error) => {
    Logger.error(`${connectionType} connection status: error %o`, error);
  });
};

export const initRedis = async () => {
  // TODO: Config should be specified for stage and prod environments (requires password)
  const redisClientPromise = createClient(redisConfig);
  initConnListeners(redisClientPromise, 'Redis');
  await redisClientPromise.connect();
  return redisClientPromise;
};

export const initIoRedis = async () => {
  const ioredis = new Redis({ host: IO_REDIS_SERVER });
  initConnListeners(ioredis, 'IO Redis');
  return ioredis;
};
