import type { ClientGame, Color } from '../state';
import type { GameClock, GameState, Result } from '@Types';

export type GameAction =
  | { type: 'INIT_GAME'; currentGame: ClientGame }
  | { type: 'SET_PLAYER_COLOR'; color: Color }
  | { type: 'UPDATE_PLAYER_CLOCK'; clock: GameClock }
  | { type: 'UPDATE_GAME_STATE'; gameState: GameState }
  | { type: 'UPDATE_GAME_RESULT'; gameResult: Result }
  | { type: 'SET_BOARD_POSITION'; position: string }
  | { type: 'SET_LOW_TIME_SOUND_PLAYED'; lowTimeSoundPlayed: boolean };

export const initGame = (currentGame: ClientGame): GameAction => {
  return {
    type: 'INIT_GAME',
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

export const updateGameResult = (gameResult: Result): GameAction => {
  return {
    type: 'UPDATE_GAME_RESULT',
    gameResult
  };
};

export const setBoardPosition = (position: string): GameAction => {
  return {
    type: 'SET_BOARD_POSITION',
    position
  };
};

export const setLowTimeSoundPlayed = (lowTimeSoundPlayed: boolean): GameAction => {
  return {
    type: 'SET_LOW_TIME_SOUND_PLAYED',
    lowTimeSoundPlayed
  };
};
