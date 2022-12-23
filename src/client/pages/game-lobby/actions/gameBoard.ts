import type { ClientGame, Color } from '../state';
import type { GameClock } from '@Types';

export type GameAction =
  | { type: 'INIT_NEW_GAME'; currentGame: ClientGame }
  | { type: 'SET_PLAYER_COLOR'; color: Color }
  | { type: 'UPDATE_PLAYER_CLOCK'; clock: GameClock };

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

export const updatePlayerTime = (clock: GameClock): GameAction => {
  return {
    type: 'UPDATE_PLAYER_CLOCK',
    clock
  };
};
