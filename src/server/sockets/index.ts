import type { Server as ioServer } from 'socket.io';
import type { RedisClientType } from 'redis';
import { initConnListeners, redisConfig } from '../utils/connect.cache';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import Logger from '../utils/config.logging.winston';
// import Logger from '@Utils/config.logging.winston';

const { SOCKET_PORT } = process.env;

const initSockets = async (io: ioServer, redisClient: RedisClientType) => {
  const pubClient = createClient(redisConfig);
  const subClient = pubClient.duplicate();
  initConnListeners(pubClient, 'Redis Publish Client');
  initConnListeners(subClient, 'Redis Subscribe Client');
  Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    io.listen(parseInt(SOCKET_PORT as string));
    Logger.info(
      `Coffee Chess Socket server running on port ${SOCKET_PORT} ☕ ♟️ 🚀`
    );
    io.on('connection', (socket) => {
      console.log(socket);
    });
  });
};

export default initSockets;
