import helmet from 'helmet';
import express, { type Express } from 'express';
import type { Server } from 'http';
import path from 'path';
import routers from './routes/index';
import morganMiddleware from '../utils/config.logging.morgan';
import cookieParser from 'cookie-parser';
import Logger from '../utils/config.logging.winston';
import handleAuthorization from './middleware/handle.authorization';

const { PORT, API_VERSION, ENV } = process.env;

const initApi = (app: Express, server: Server) => {
  const PUBLIC = '../../../src/client/public';
  app.use(express.json());
  app.use(cookieParser());
  app.use(morganMiddleware);
  app.use(helmet());
  app.use(
    '/favicon.ico',
    express.static(path.resolve(__dirname, `${PUBLIC}/images/favicon.ico`))
  );
  app.use(
    '/game-start.mp3',
    handleAuthorization,
    express.static(path.resolve(__dirname, `${PUBLIC}/sounds/game-start.mp3`))
  );
  app.use(
    '/piece-move.mp3',
    handleAuthorization,
    express.static(path.resolve(__dirname, `${PUBLIC}/sounds/piece-move.mp3`))
  );
  app.use(
    '/tic-toc.wav',
    handleAuthorization,
    express.static(path.resolve(__dirname, `${PUBLIC}/sounds/tic-toc.wav`))
  );
  app.use(
    '/notification.wav',
    handleAuthorization,
    express.static(path.resolve(__dirname, `${PUBLIC}/sounds/notification.wav`))
  );
  app.use(express.static(path.resolve(__dirname, '../../../dist/client')));
  app.use(routers.pageRouter);
  app.use(`/api/${API_VERSION}`, routers.apiRouter);

  server.listen(PORT, () =>
    Logger.info(`Coffee Chess API server running on port ${PORT} ☕ ♟️ 🚀`)
  );
};

export default initApi;
