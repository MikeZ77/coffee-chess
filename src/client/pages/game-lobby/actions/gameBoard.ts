import type { ClientGame } from '../state';

export type GameAction = { type: 'INIT_NEW_GAME'; currentGame: ClientGame };

export const initNewGame = (currentGame: ClientGame): GameAction => {
  return {
    type: 'INIT_NEW_GAME',
    currentGame
  };
};
