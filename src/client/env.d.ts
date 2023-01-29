export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLIENT_GAME_CLOCK_TICK_MS: string;
      GAME_CLOCK_SERVER_SYNC_MS: string;
      GAME_CHAT_CLIENT_TIMEOUT_MS: string;
      GAME_LOW_TIME_MS: string;
      DISCONNECT_NOTIFICATION_INTERVAL: string;
      ENV: string;
    }
  }
}
