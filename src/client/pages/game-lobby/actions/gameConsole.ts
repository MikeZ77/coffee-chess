export type GameConsoleAction = {
  type: 'UPDATE_CHAT_MESSAGE';
  gameChatMessage: string;
};
// | { type: 'TEST_ACTION'; test: string };

export const updateChatMessage = (
  gameChatMessage: string
): GameConsoleAction => {
  return {
    type: 'UPDATE_CHAT_MESSAGE',
    gameChatMessage
  };
};
