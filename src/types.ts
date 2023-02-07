/*
This file exports the interfaces for the client payload and the server response. 
It acts as the data definition or contract between the client and the server and
is accessed by both.
*/

/*********************************** HTTP PAYLOADS ***************************************/
export type RegisterPayload = {
  username: string;
  password: string;
  email: string;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type SearchPayload = void;
export type GamePayloads = SearchPayload;

/***********************************HTTP RESPONSES **************************************/
export enum ClientErrorCodes {
  QUEUE_SEARCH_ERROR = 1
}

export type BasicResponse = {
  message: string;
};

export type ErrorResponse = {
  message: string;
  clientCode?: ClientErrorCodes;
};

/********************************** STATE OBJECTS **********************************/

export type UserState =
  | 'IDLE'
  | 'PLAYING'
  | 'SEARCHING'
  | 'DISCONNECTED'
  | 'OBSERVING'
  | 'SEARCHING_OBSERVING';
type PingInfo = { timestampUtc: string; ms: number };
export type UserSession = {
  userId: string;
  username: string;
  state: UserState;
  playingGame: string | null;
  observingGame: string | null;
  lastActivity: string;
  latency: PingInfo[];
};

export type TimeControl = '1+0' | '5+0' | '15+0';
export type QueueRecord = {
  userId: string;
  username: string;
  type: TimeControl;
  rating: number;
  searchStart: string;
};

export type GameState = 'PENDING' | 'ABORTED' | 'IN_PROGRESS' | 'COMPLETE';
export type GameChat = { username?: string; message: string };
export type GameHistory = {
  from: string;
  to: string;
  position: string;
  piece: string;
  captured?: string;
  promotion?: string;
};
export type Result = ('WHITE' | 'BLACK' | 'DRAW') | null;
export interface Game {
  gameId: string;
  userWhite: string;
  userWhiteId?: string;
  ratingWhite: number;
  userBlack: string;
  userBlackId?: string;
  ratingBlack: number;
  watching: string[];
  type: TimeControl;
  whiteTime: number;
  blackTime: number;
  state: GameState;
  position: string;
  pendingDrawOfferFrom: string | null;
  history: GameHistory[];
  gameChat: GameChat[];
  result: Result;
  startTime: string | null;
}

export interface GameInProgress extends Game {
  userWhiteId: string;
  userBlackId: string;
  state: 'IN_PROGRESS';
  result: null;
  startTime: string;
}

export interface GameInPending extends Game {
  userWhiteId: string;
  userBlackId: string;
  state: 'PENDING';
  result: null;
  startTime: null;
}

export interface GameInAborted extends Game {
  userWhiteId: string;
  userBlackId: string;
  state: 'ABORTED';
  result: null;
  startTime: string;
}

/********************************* SOCKET MESSAGES **************************************/

export type UserInfo = {
  userId: string;
  username: string;
};

export type ServerMessage =
  | { type: 'MULTIPLE_WINDOWS' }
  | { type: 'SERVER_MESSAGE'; data: string };

export type GameMessage = GameConfirmation | GameAborted;
export type GameConfirmation = { ready: boolean };
export type GameAborted = { aborted: boolean };
export type GameClock = { whiteTime: number; blackTime: number; timestampUtc?: string };
export type GameMove = { from: string; to: string; promotion?: string; timestampUtc?: string };
export type ResultReason = 'RESIGN' | 'DRAW' | 'CHECKMATE' | 'TIME_WHITE' | 'TIME_BLACK';
export type GameComplete = {
  type: ResultReason;
  newWhiteRating: number;
  newBlackRating: number;
  result: Result;
};
export type UserConnected = string;

/*********************************** TYPE GUARDS ****************************************/
export type RedisJSON = Object | null;

export const isUserSession = (user: RedisJSON): user is UserSession => {
  return user && 'userId' in user ? true : false;
};

export const isGame = (game: RedisJSON): game is Game => {
  return game && 'gameId' in game ? true : false;
};

export const isGameInProgress = (game: RedisJSON): game is GameInProgress => {
  return (game as GameInProgress).state === 'IN_PROGRESS';
};

export const isGamePending = (game: RedisJSON): game is GameInPending => {
  return (game as GameInPending).state === 'PENDING';
};

export const isGameAborted = (game: RedisJSON): game is GameInAborted => {
  return (game as GameInAborted).state === 'ABORTED';
};
