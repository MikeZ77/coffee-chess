/*
This file exports the interfaces for the client payload and the server response. 
It acts as the data definition or contract between the client and the server and
is accessed by both.
*/

/*************************************** PAYLOADS ***************************************/
export interface RegisterPayload {
  username: string;
  password: string;
  email: string;
}

/*************************************** RESPONSES **************************************/
export interface BasicResponse {
  message: string;
}

/*************************************** STATE OBJECTS **********************************/

export type UserSession = {
  userId: string;
  username: string;
  state: 'IDLE' | 'PLAYING' | 'SEARCHING' | 'DISCONNECTED';
  playingGame: string | null;
  watchingGame: string | null;
  lastActivity: string;
};
