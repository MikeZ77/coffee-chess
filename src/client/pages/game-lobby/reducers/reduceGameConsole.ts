import { Reducer } from 'common/types';
import { State } from '../state';
import { GameConsoleAction } from '../actions/index';

const reduceGameConsole: Reducer<State, GameConsoleAction> = (
  action,
  state
): State => {
  switch (action.type) {
    case 'UPDATE_CHAT_MESSAGE': {
      const { gameChatMessage } = action;
      return {
        ...state,
        reduced: true,
        gameConsole: { ...state.gameConsole, gameChatMessage }
      };
    }
    default: {
      return state;
    }
  }
};

export default reduceGameConsole;
