import helmet from 'helmet';
import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import router from './routes/index';

dotenv.config();
const { PORT, ENV, API_VERSION } = process.env;

const initApi = (app) => {
  app.use(helmet());
  app.use(express.json());
  app.use(morgan(ENV === 'dev' ? 'dev' : 'combined'));
  app.use(express.static(path.resolve(__dirname, '../../client')));

  app.use(`/api/${API_VERSION}`, router);

  app.listen(PORT, () =>
    console.log(`Coffee Chess running on port ${PORT} ☕ ♟️ 🚀`)
  );
};

export default initApi;
