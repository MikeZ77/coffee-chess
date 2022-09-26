import dotenv from 'dotenv';

dotenv.config();

const { PORT, ENV, DB_NAME, DB_SERVER, DB_PASSWORD, DB_USER, REDIS_URL } =
  process.env;

export default {
  PORT,
  ENV,
  DB_NAME,
  DB_SERVER,
  DB_PASSWORD,
  DB_USER,
  REDIS_URL
};
