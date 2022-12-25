export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLIENT_GAME_CLOCK_TICK_MS: string;
      GAME_CLOCK_SERVER_SYNC_MS: string;
    }
  }
}
