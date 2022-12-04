/*
This file exports the interfaces for the client payload and the server response. 
It acts as the data definition or contract between the client and the server and
is accessed by both.
*/

/*************************************** PAYLOADS ***************************************/
export type RegisterPayload = {
  username: string;
  password: string;
  email: string;
};

export type LoginPayload = {
  username: string;
  password: string;
};

/*************************************** RESPONSES **************************************/
export type BasicResponse = {
  message: string;
};

/*************************************** STATE OBJECTS **********************************/

export type UserStates = 'IDLE' | 'PLAYING' | 'SEARCHING' | 'DISCONNECTED' | 'OBSERVING';
export type UserSession = {
  userId: string;
  username: string;
  state: UserStates;
  playingGame: string | null;
  watchingGame: string | null;
  lastActivity: string;
};

export type TimeControls = '1+0' | '5+0' | '15+0';
export type GameSearch = {
  userId: string;
  usernmae: string;
  type: TimeControls;
  rating: number;
  searchStart: string;
};
