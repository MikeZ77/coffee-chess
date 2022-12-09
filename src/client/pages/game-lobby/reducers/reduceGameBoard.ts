import { Reducer } from 'common/types';
import { State } from '../state';
import { GameAction } from '../actions/index';

const reduceGameBoard: Reducer<State, GameAction> = (action, state): State => {
  switch (action.type) {
    case 'INIT_NEW_GAME': {
      const { currentGame } = action;
      return {
        ...state,
        reduced: true,
        currentGame: { ...currentGame }
      };
    }
    case 'SET_PLAYER_COLOR': {
      const { color } = action;
      return {
        ...state,
        reduced: true,
        currentGame: { ...state.currentGame, color }
      };
    }
    default: {
      return state;
    }
  }
};

export default reduceGameBoard;
