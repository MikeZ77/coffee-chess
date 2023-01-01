import type { Reducer } from 'common/types';
import { State } from '../state';
import { GameConsoleAction } from '../actions/index';

const reduceGameConsole: Reducer<State, GameConsoleAction> = (action, state): State => {
  switch (action.type) {
    case 'UPDATE_CHAT_MESSAGE': {
      const { gameChatMessage } = action;
      return {
        ...state,
        reduced: true,
        gameConsole: { ...state.gameConsole, gameChatMessage }
      };
    }
    case 'CLEAR_CHAT_MESSAGE': {
      return {
        ...state,
        reduced: true,
        gameConsole: { ...state.gameConsole, gameChatMessage: '' }
      };
    }
    case 'UPDATE_CHAT_LOG': {
      const { chatMessageFromServer } = action;
      const gameChat = state.currentGame.gameChat;
      gameChat.push(chatMessageFromServer);
      return {
        ...state,
        reduced: true,
        currentGame: { ...state.currentGame, gameChat: [...gameChat] }
      };
    }
    case 'UPDATE_DRAW_OFFER': {
      const { pendingDrawOfferFrom } = action;
      return {
        ...state,
        reduced: true,
        currentGame: { ...state.currentGame, pendingDrawOfferFrom }
      };
    }
    case 'SET_CHAT_TIMEOUT': {
      const { timeout } = action;
      return {
        ...state,
        reduced: true,
        gameConsole: { ...state.gameConsole, timeout }
      };
    }
    case 'SET_DISABLE_CHAT': {
      const { disableChat } = action;
      return {
        ...state,
        reduced: true,
        gameConsole: { ...state.gameConsole, disableChat }
      };
    }
    default: {
      return state;
    }
  }
};

export default reduceGameConsole;
