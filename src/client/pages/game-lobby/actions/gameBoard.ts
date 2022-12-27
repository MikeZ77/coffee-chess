import type { ClientGame, Color } from '../state';
import type { GameClock, GameState } from '@Types';

export type GameAction =
  | { type: 'INIT_NEW_GAME'; currentGame: ClientGame }
  | { type: 'SET_PLAYER_COLOR'; color: Color }
  | { type: 'UPDATE_PLAYER_CLOCK'; clock: GameClock }
  | { type: 'UPDATE_GAME_STATE'; gameState: GameState };

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

export const updateGameState = (gameState: GameState): GameAction => {
  return {
    type: 'UPDATE_GAME_STATE',
    gameState
  };
};
