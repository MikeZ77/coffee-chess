import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import initRedis from './utils/connect.cache';
import initDb from './utils/connect.database';
import initApi from './api/app';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const server = createServer(app);
const io = new Server(server);
const redisClient = initRedis();
const dbClient = initDb();
initApi(app);

export { redisClient, dbClient };
