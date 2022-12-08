import type { Reducer } from 'common/types';
import type { UserConnected } from '@Types';
import { State } from '../state';
import { GameConsoleAction } from '../actions/index';

const reduceGameConsole: Reducer<State, GameConsoleAction> = (action, state): State => {
  state = { ...state, reduced: true };
  switch (action.type) {
    case 'UPDATE_CHAT_MESSAGE': {
      const { gameChatMessage } = action;
      return {
        ...state,
        gameConsole: { ...state.gameConsole, gameChatMessage }
      };
    }
    case 'SEND_CHAT_MESSAGE': {
      /* TODO: This should send gameChatMessage to the server and then clear it.
        The message will then be added by UPDATE_CHAT_LOG.*/
      return {
        ...state,
        gameConsole: { ...state.gameConsole, gameChatMessage: '' }
      };
    }
    case 'UPDATE_CHAT_LOG': {
      const { chatMessageFromServer } = action;
      const gameChat = state.currentGame.gameChat;
      gameChat.push(chatMessageFromServer);
      return {
        ...state,
        currentGame: { ...state.currentGame, gameChat: [...gameChat] }
      };
    }
    default: {
      return state;
    }
  }
};

export default reduceGameConsole;
