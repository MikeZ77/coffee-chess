import tippy from 'tippy.js';
import type { Dispatch } from '@Common/types';
import {
  type NavBarAction,
  type GameConsoleAction,
  setChatTimeout,
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
  const whiteDelta = newWhiteRating - <number>ratingWhite;
  const blackDelta = newBlackRating - <number>ratingBlack;
  gameCompleteToast(
    `
    ${gameMessage}\n
    ${userWhite} rating ${whiteDelta > 0 ? '+' : ''}${whiteDelta} (${newWhiteRating})
    ${userBlack} rating ${blackDelta > 0 ? '+' : ''}${blackDelta} (${newBlackRating}) 
    `
  );
};

export const initChatTimeout = (
  dispatch: Dispatch<GameConsoleAction>,
  chatTimeoutMs: number
): void => {
  dispatch(setChatTimeout(true));
  setTimeout(() => {
    dispatch(setChatTimeout(false));
  }, chatTimeoutMs);
};

export const highlightCurrentMoveHistory = (
  currentPosition: string,
  prevPosition?: string
) => {
  console.log('currentPosition', currentPosition);
  console.log('prevPosition', prevPosition);
  if (prevPosition) {
    document.getElementById(
      prevPosition.replaceAll('/', '_').replaceAll(' ', '_')
    )!.style.backgroundColor = '';
  }
  document.getElementById(
    currentPosition.replaceAll('/', '_').replaceAll(' ', '_')
  )!.style.backgroundColor = 'honeydew';
};
