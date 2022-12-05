import type { Server as ioServer } from 'socket.io';
import type { RedisClientType } from 'redis';
import type { Redis } from 'ioredis';
import { initConnListeners } from '../utils/connect.cache';
import { createAdapter } from '@socket.io/redis-adapter';
import Logger from '@Utils/config.logging.winston';
import { registerNewGameListener } from './handlers/index';

const { PORT } = process.env;

const initSockets = async (
  io: ioServer,
  redisClient: RedisClientType,
  ioRedisClient: Redis
) => {
  const pubClient = redisClient.duplicate();
  const subClient = redisClient.duplicate();
  const subInitGameClient = redisClient.duplicate();
  initConnListeners(pubClient, 'Redis Rooms Publish Client');
  initConnListeners(subClient, 'Redis Rooms Subscribe Client');
  initConnListeners(subInitGameClient, 'Redis New Game Subscriber Client');
  Promise.all([pubClient.connect(), subClient.connect(), subInitGameClient.connect()]).then(
    () => {
      io.adapter(createAdapter(pubClient, subClient));
      Logger.info(`Coffee Chess Socket server running on port ${PORT} ☕ ♟️ 🚀`);
      io.on('connection', (socket) => {
        console.log(`${socket.id} is connected!`);
        // TODO: Start joining clients to rooms.
        registerNewGameListener(io, subInitGameClient, ioRedisClient);
      });
    }
  );
};

export default initSockets;
