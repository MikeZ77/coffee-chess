import helmet from 'helmet';
import express from 'express';
import path from 'path';
import router from './routes/index';
import morganMiddleware from '../utils/config.logging.morgan';
import cookieParser from 'cookie-parser';
import Logger from '../utils/config.logging.winston';

const { PORT, API_VERSION } = process.env;

const initApi = (app) => {
  app.use(helmet());
  app.use(express.json());
  app.use(cookieParser());
  app.use(morganMiddleware);
  app.use(express.static(path.resolve(__dirname, '../../client')));

  app.use(`/api/${API_VERSION}`, router);

  app.listen(PORT, () =>
    Logger.info(`Coffee Chess running on port ${PORT} ☕ ♟️ 🚀`)
  );
};

export default initApi;
