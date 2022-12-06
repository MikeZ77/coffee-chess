export type GameConsoleAction =
  | { type: 'UPDATE_CHAT_MESSAGE'; gameChatMessage: string }
  | { type: 'SEND_CHAT_MESSAGE' };

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
