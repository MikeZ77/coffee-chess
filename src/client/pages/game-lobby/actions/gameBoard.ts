import type { ClientGame, Color } from '../state';

export type GameAction =
  | { type: 'INIT_NEW_GAME'; currentGame: ClientGame }
  | { type: 'SET_PLAYER_COLOR'; color: Color };

export const initNewGame = (currentGame: ClientGame): GameAction => {
  return {
    type: 'INIT_NEW_GAME',
    currentGame
  };
};

export const setPlayerColor = (color: Color): GameAction => {
  return {
    type: 'SET_PLAYER_COLOR',
    color
  };
};
