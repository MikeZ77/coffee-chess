import helmet from 'helmet';
import express from 'express';
import path from 'path';
import router from './routes/index';
import morganMiddleware from './middleware/logging.http';
import Logger from '../utils/logging.config';

const { PORT, API_VERSION } = process.env;

const initApi = (app) => {
  app.use(helmet());
  app.use(express.json());
  app.use(morganMiddleware);
  app.use(express.static(path.resolve(__dirname, '../../client')));

  app.use(`/api/${API_VERSION}`, router);

  app.listen(PORT, () =>
    Logger.info(`Coffee Chess running on port ${PORT} ☕ ♟️ 🚀`)
  );
};

export default initApi;
