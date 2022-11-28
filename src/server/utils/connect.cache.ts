import { createClient } from 'redis';
import Logger from './config.logging.winston';

type RedisClient = ReturnType<typeof createClient>;
const { CACHE_SERVER } = process.env;

export const redisConfig = {
  url: CACHE_SERVER,
  socket: {
    reconnectStrategy() {
      return 5000;
    }
  }
};

export const initConnListeners = (
  conn: RedisClient,
  connectionType: string
) => {
  conn.on('connect', () => {
    Logger.info(`${connectionType} connection status: connected`);
  });
  conn.on('end', () => {
    Logger.info(`${connectionType} connection status: disconnected`);
  });
  conn.on('reconnecting', () => {
    Logger.warn(`${connectionType} connection status: reconnecting`);
  });
  conn.on('error', (error) => {
    Logger.error(`${connectionType} connection status: error`, error);
  });
};

const initRedis = async () => {
  // TODO: Config should be specified for stage and prod environments
  const redisClientPromise = createClient(redisConfig);
  initConnListeners(redisClientPromise, 'Redis');
  await redisClientPromise.connect();
  return redisClientPromise;
};

export default initRedis;
