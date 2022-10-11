import sql, { config } from 'mssql';
import Logger from './config.logging.winston';

const { DB_USER, DB_PASSWORD, DB_NAME, DB_SERVER } = process.env;

const sqlServerConfig: config = {
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  server: DB_SERVER as string,
  options: {
    trustServerCertificate: true
  }
};

const initDb = async () => {
  try {
    const appPool = new sql.ConnectionPool(sqlServerConfig);
    const pool = await appPool.connect();
    Logger.info('Connected to SQL Server');
    return pool;
  } catch (error) {
    Logger.error('Error connecting to SQL server: %o', error);
  }
};

export default initDb;
