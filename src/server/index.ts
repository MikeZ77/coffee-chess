import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { initRedis, initIoRedis } from './utils/connect.cache';
import initDb from './utils/connect.database';
import initApi from './api/app';
import initSockets from './sockets/index';
import dotenv from 'dotenv';
import initGameSearchQueues from '@Utils/init.queues';

dotenv.config();

(async () => {
  const app = express();
  const redisClient = await initRedis();
  const ioredisClient = await initIoRedis();
  const connPool = await initDb();
  app.locals.db = connPool;
  app.locals.redis = redisClient;
  app.locals.ioredis = ioredisClient;
  const server = createServer(app);
  const io = new Server(server);
  await initGameSearchQueues(app.locals.redis);
  initApi(app);
  initSockets(io, app.locals.redis);
})();
