import { GameChat } from '@Types';

export type GameConsoleAction =
  | { type: 'UPDATE_CHAT_MESSAGE'; gameChatMessage: string }
  | { type: 'SEND_CHAT_MESSAGE' }
  | { type: 'UPDATE_CHAT_LOG'; chatMessageFromServer: GameChat }
  | { type: 'UPDATE_DRAW_OFFER'; pendingDrawOfferFrom: string | null };

export const updateChatMessage = (gameChatMessage: string): GameConsoleAction => {
  return {
    type: 'UPDATE_CHAT_MESSAGE',
    gameChatMessage
  };
};

export const sendChatMessage = (): GameConsoleAction => {
  return {
    type: 'SEND_CHAT_MESSAGE'
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
