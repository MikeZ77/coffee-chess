import helmet from 'helmet';
import express, { Express } from 'express';
import path from 'path';
import routers from './routes/index';
import morganMiddleware from '../utils/config.logging.morgan';
import cookieParser from 'cookie-parser';
import Logger from '../utils/config.logging.winston';

const { PORT, API_VERSION } = process.env;

const initApi = (app: Express) => {
  app.use(helmet());
  app.use(express.json());
  app.use(cookieParser());
  app.use(morganMiddleware);
  app.use(
    '/favicon.ico',
    express.static(path.resolve(__dirname, '../../../src/client/public/images/favicon.ico'))
  );
  app.use(express.static(path.resolve(__dirname, '../../../dist/client')));
  app.use(routers.pageRouter);
  app.use(`/api/${API_VERSION}`, routers.apiRouter);

  app.listen(PORT, () =>
    Logger.info(`Coffee Chess API server running on port ${PORT} ☕ ♟️ 🚀`)
  );
};

export default initApi;
