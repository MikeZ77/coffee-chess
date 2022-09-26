import dbClient from 'mssql';
import env from './env.config';

const sqlServerConfig = {
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  server: env.DB_SERVER,
  options: {
    trustServerCertificate: true
  }
};

const initDb = async () => {
  try {
    await dbClient.connect(sqlServerConfig);
    console.log('Connected to SQL Server');
    return dbClient;
  } catch (error) {
    console.log('Error connecting to SQL server', error);
  }
};

export default initDb;
