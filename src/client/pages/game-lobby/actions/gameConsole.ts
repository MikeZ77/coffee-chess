import { GameChat, GameHistory } from '@Types';

export type GameConsoleAction =
  | { type: 'UPDATE_CHAT_MESSAGE'; gameChatMessage: string }
  | { type: 'CLEAR_CHAT_MESSAGE' }
  | { type: 'UPDATE_CHAT_LOG'; chatMessageFromServer: GameChat }
  | { type: 'UPDATE_DRAW_OFFER'; pendingDrawOfferFrom: string | null }
  | { type: 'SET_CHAT_TIMEOUT'; timeout: boolean }
  | { type: 'SET_DISABLE_CHAT'; disableChat: boolean }
  | { type: 'UPDATE_GAME_HISTORY'; move: GameHistory }
  | { type: 'RESET_GAME_STATE' };

export const updateChatMessage = (gameChatMessage: string): GameConsoleAction => {
  return {
    type: 'UPDATE_CHAT_MESSAGE',
    gameChatMessage
  };
};

export const clearChatMessage = (): GameConsoleAction => {
  return {
    type: 'CLEAR_CHAT_MESSAGE'
  };
};

export const updateChatLog = (chatMessageFromServer: GameChat): GameConsoleAction => {
  return {
    type: 'UPDATE_CHAT_LOG',
    chatMessageFromServer
  };
};

export const updateDrawOffer = (pendingDrawOfferFrom: string | null): GameConsoleAction => {
  return {
    type: 'UPDATE_DRAW_OFFER',
    pendingDrawOfferFrom
  };
};

export const setChatTimeout = (timeout: boolean): GameConsoleAction => {
  return {
    type: 'SET_CHAT_TIMEOUT',
    timeout
  };
};

export const setDisableChat = (disableChat: boolean): GameConsoleAction => {
  return {
    type: 'SET_DISABLE_CHAT',
    disableChat
  };
};

export const updateConsoleMoveHistory = (move: GameHistory): GameConsoleAction => {
  return {
    type: 'UPDATE_GAME_HISTORY',
    move
  };
};

export const resetGameState = (): GameConsoleAction => {
  return { type: 'RESET_GAME_STATE' };
};
