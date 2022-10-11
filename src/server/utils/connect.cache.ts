import { createClient } from 'redis';
import Logger from './config.logging.winston';

type RedisClient = ReturnType<typeof createClient>;
const { CACHE_SERVER } = process.env;

const initConnListeners = (conn: RedisClient) => {
  conn.on('connect', () => {
    Logger.info('Redis connection status: connected');
  });
  conn.on('end', () => {
    Logger.info('Redis connection status: disconnected');
  });
  conn.on('reconnecting', () => {
    Logger.warn('Redis connection status: reconnecting');
  });
  conn.on('error', (error) => {
    Logger.error('Redis connection status: error ', error);
  });
};

const initRedis = async () => {
  // TODO: Config should be specified for stage and prod environments
  const redisClientPromise = createClient({
    url: CACHE_SERVER,
    socket: {
      reconnectStrategy() {
        return 5000;
      }
    }
  });
  initConnListeners(redisClientPromise);
  await redisClientPromise.connect();
  return redisClientPromise;
};

export default initRedis;
