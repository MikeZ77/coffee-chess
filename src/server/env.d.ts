/*
    Note that dotenv imports every env variable as a string or undefined.
    This interfaces tells typescript the env types.
*/

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NOTIFICATION_TIMEOUT_MS: string;
      ENV: 'dev' | 'stage' | 'prod';
      PORT: string;
      SOCKET_PORT: string;
      API_VERSION: string;
      DB_NAME: string;
      DB_SERVER: string;
      DB_PASSWORD: string;
      DB_USER: string;
      REDIS_SERVER: string;
      IO_REDIS_SERVER: string;
      EMAIL_USERNAME: string;
      EMAIL_PASSWORD: string;
      EMAIL_HOST: string;
      SERVER_FQDN: string;
      JWT_SECRET: string;
      JWT_EXPIRY_HOURS: string;
      QUEUE_LOCK_TTL_MS: string;
      QUEUE_RATING_MATCH: string;
      DEFAULT_RATING: string;
      GAME_OBJECT_EXPIRY_SECONDS: string;
      GAME_ABORT_MS: string;
      GAME_CLOCK_TICK_MS: string;
    }
  }
}

export {};
