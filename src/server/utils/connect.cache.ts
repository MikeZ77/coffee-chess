import { createClient } from 'redis';
import env from './env.config';

const initConnListeners = (conn) => {
  conn.on('connect', () => {
    console.log('Redis - Connection status: connected');
  });
  conn.on('end', () => {
    console.log('Redis - Connection status: disconnected');
  });
  conn.on('reconnecting', () => {
    console.log('Redis - Connection status: reconnecting');
  });
  conn.on('error', (error) => {
    console.log('Redis - Connection status: error ', { error });
  });
};

const initRedis = async () => {
  // TODO: Config should be specified for stage and prod environments
  const redisClient = createClient({
    url: env.REDIS_URL,
    socket: {
      reconnectStrategy() {
        return 5000;
      }
    }
  });
  console.log('Connected to Redis');
  initConnListeners(redisClient);
  await redisClient.connect();
  return redisClient;
};

export default initRedis;
