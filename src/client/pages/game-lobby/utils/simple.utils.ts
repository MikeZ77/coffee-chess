import tippy from 'tippy.js';
import type { Dispatch } from '@Common/types';
import {
  type NavBarAction,
  spinnerSearchOneMinute,
  spinnerSearchFiveMinute,
  spinnerSearchFifteenMinute
} from '../actions/index';
import { gameCompleteToast } from '@Common/toast';
import events from 'events';

interface ITooltip {
  [key: string]: string;
}

export const initTooltipAttributes = (tooltipInfo: ITooltip): void => {
  for (const [id, message] of Object.entries(tooltipInfo)) {
    tippy(id, { content: message });
  }
};

export const initEventListeners = (): void => {
  document.getElementById('message-game-chat')?.addEventListener('keyup', (e) => {
    e.preventDefault();
    if (e.key === 'Enter') {
      document.getElementById('button-game-chat')?.click();
    }
  });
};

export const clearQueueSpinners = (dispatch: Dispatch<NavBarAction>) => {
  dispatch(spinnerSearchOneMinute(false));
  dispatch(spinnerSearchFiveMinute(false));
  dispatch(spinnerSearchFifteenMinute(false));
};

export const clientEvent = new events.EventEmitter();

export interface IGameMessageData {
  gameMessage: string;
  userWhite: string;
  userBlack: string;
  newWhiteRating: number;
  newBlackRating: number;
  ratingWhite: number;
  ratingBlack: number;
}

export const gameCompleteToastHelper = (gameData: IGameMessageData): void => {
  const {
    gameMessage,
    userWhite,
    userBlack,
    newWhiteRating,
    newBlackRating,
    ratingWhite,
    ratingBlack
  } = gameData;
  gameCompleteToast(
    `
    ${gameMessage}\n
    ${userWhite} rating ${newWhiteRating - <number>ratingWhite} (${newWhiteRating}) \n
    ${userBlack} rating ${newBlackRating - <number>ratingBlack} (${newBlackRating}) 
    `
  );
};
