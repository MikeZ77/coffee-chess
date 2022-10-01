import dbClient from 'mssql';
import Logger from './logging.config.winston';

const { DB_USER, DB_PASSWORD, DB_NAME, DB_SERVER } = process.env;

const sqlServerConfig = {
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  server: DB_SERVER,
  options: {
    trustServerCertificate: true
  }
};

const initDb = async () => {
  try {
    const dbPoolPromise = await dbClient.connect(sqlServerConfig);
    Logger.info('Connected to SQL Server');
    return dbPoolPromise;
  } catch (error) {
    Logger.error('Error connecting to SQL server: %o', error);
  }
};

export default initDb;
