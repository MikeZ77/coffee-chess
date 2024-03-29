import type { Server as ioServer } from 'socket.io';
import type { RedisClientType } from 'redis';
import type { ConnectionPool } from 'mssql';
import { createAdapter } from '@socket.io/redis-adapter';
import Logger from '@Utils/config.logging.winston';
import { GameManager, UserManager, QueueManager, Manager } from './managers/index';

const { PORT } = process.env;

const initSockets = async (
  io: ioServer,
  redisClient: RedisClientType,
  dbConnPool: ConnectionPool
) => {
  const pubClient = redisClient.duplicate();
  const subClient = redisClient.duplicate();
  const queueClient = redisClient.duplicate();
  io.use(Manager.authMiddleware);
  // TODO: Setup a disconnect handler.
  Promise.all([pubClient.connect(), subClient.connect(), queueClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    // registerNewGameListener(io, redisClient, subInitGameClient);
    new QueueManager(io, redisClient, queueClient).listenMatchQueue();
    Logger.info(`Coffee Chess Socket server running on port ${PORT} ☕ ♟️ 🚀`);
    io.on('connection', (socket) => {
      // TODO: Investigate using socket.use() middleware to check for expired token and emit
      //       a logout signal to the client. Also see if this middleware can be used in GameManager.
      Logger.info(`User ${socket.data.username} ${socket.data.userId} is connected.`);
      UserManager.sendUserInfo(socket);
      Manager.checkClientConnections(io, socket);
      Manager.getConnectionPing(socket, redisClient);
      new GameManager(io, socket, redisClient, dbConnPool);
    });
  });
};

export default initSockets;
