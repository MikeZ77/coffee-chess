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

/***********************************HTTP RESPONSES **************************************/
export type BasicResponse = {
  message: string;
};

/********************************** STATE OBJECTS **********************************/

export type UserState =
  | 'IDLE'
  | 'PLAYING'
  | 'SEARCHING'
  | 'DISCONNECTED'
  | 'OBSERVING'
  | 'SEARCHING_OBSERVING';
export type UserSession = {
  userId: string;
  username: string;
  state: UserState;
  playingGame: string | null;
  observingGame: string | null;
  lastActivity: string;
};

export type TimeControl = '1+0' | '5+0' | '15+0';
export type QueueRecord = {
  userId: string;
  username: string;
  type: TimeControl;
  rating: number;
  searchStart: string;
};

export type GameState = 'PENDING' | 'ABORT' | 'IN_PROGRESS' | 'COMPLETE';
export type GameResult = ('WHITE' | 'BLACK') | null;
export type GameChat = { username: string; message: string };
export type Game = {
  gameId: string;
  userWhite: string;
  userWhiteId?: string;
  ratingWhite: number;
  userBlack: string;
  userBlackId?: string;
  ratingBlack: number;
  watching: string[];
  type: TimeControl;
  whiteTime: string;
  blackTime: string;
  state: GameState;
  position: string;
  gameChat: GameChat[];
  result: GameResult;
  startTime: string | null;
};

/********************************* SOCKET MESSAGES **************************************/

export type UserInfo = {
  userId: string;
  username: string;
};

export type Confirmation = { ready: boolean };
