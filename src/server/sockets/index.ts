import type { Server as ioServer } from 'socket.io';
import type { RedisClientType } from 'redis';
import type { Redis } from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import Logger from '@Utils/config.logging.winston';
import { GameManager, UserManager, Manager } from './managers/index';
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
  io.use(Manager.authMiddleware);
  // TODO: Update latency game middleware.
  // TODO: Setup a disconnect handler.
  Promise.all([pubClient.connect(), subClient.connect(), subInitGameClient.connect()]).then(
    () => {
      io.adapter(createAdapter(pubClient, subClient));
      registerNewGameListener(io, redisClient, subInitGameClient);
      Logger.info(`Coffee Chess Socket server running on port ${PORT} ☕ ♟️ 🚀`);
      io.on('connection', (socket) => {
        Logger.info(`User ${socket.data.username} ${socket.data.userId} is connected.`);
        UserManager.sendUserInfo(socket);
        Manager.checkClientConnections(io, socket);
        Manager.getConnectionPing(socket, redisClient);
        new GameManager(io, socket, redisClient);
      });
    }
  );
};

export default initSockets;
