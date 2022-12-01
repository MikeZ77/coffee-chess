/*
    Note that dotenv imports every env variable as a string or undefined.
    This interfaces tells typescript the env types.
*/

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NOTIFICATION_TIMEOUT_MS: string;
      ENV: 'dev' | 'stage' | 'prod';
      PORT: '3000';
      API_VERSION: string;
      DB_NAME: string;
      DB_SERVER: string;
      DB_PASSWORD: string;
      DB_USER: string;
      CACHE_SERVER: string;
      EMAIL_USERNAME: string;
      EMAIL_PASSWORD: string;
      EMAIL_HOST: string;
      SERVER_FQDN: string;
      JWT_SECRET: string;
      JWT_EXPIRY_HOURS: string;
    }
  }
}

export {};
