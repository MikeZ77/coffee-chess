import helmet from 'helmet';
import express, { Express } from 'express';
import path from 'path';
import routers from './routes/index';
import morganMiddleware from '../utils/config.logging.morgan';
import cookieParser from 'cookie-parser';
import Logger from '../utils/config.logging.winston';

const { PORT, API_VERSION } = process.env;

const initApi = (app: Express) => {
  // app.use(  helmet({
  //   contentSecurityPolicy: false,
  // }));
  app.use(helmet());
  app.use(express.json());
  app.use(cookieParser());
  app.use(morganMiddleware);
  app.use(express.static(path.resolve(__dirname, '../../../dist/client')));
  app.use(routers.pageRouter)
  app.use(`/api/${API_VERSION}`, routers.apiRouter);

  app.listen(PORT, () =>
    Logger.info(`Coffee Chess running on port ${PORT} ☕ ♟️ 🚀`)
  );
};

export default initApi;
