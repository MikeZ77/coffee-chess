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
    case 'UPDATE_PLAYER_CLOCK': {
      const { whiteTime, blackTime } = action.clock;
      return {
        ...state,
        reduced: true,
        currentGame: { ...state.currentGame, whiteTime, blackTime }
      };
    }
    case 'UPDATE_GAME_STATE': {
      const { gameState } = action;
      return {
        ...state,
        reduced: true,
        currentGame: { ...state.currentGame, state: gameState }
      };
    }
    case 'UPDATE_GAME_RESULT': {
      const { gameResult } = action;
      return {
        ...state,
        reduced: true,
        currentGame: { ...state.currentGame, result: gameResult }
      };
    }
    case 'SET_BOARD_POSITION': {
      const { position } = action;
      return {
        ...state,
        reduced: true,
        currentGame: { ...state.currentGame, position }
      };
    }
    default: {
      return state;
    }
  }
};

export default reduceGameBoard;
