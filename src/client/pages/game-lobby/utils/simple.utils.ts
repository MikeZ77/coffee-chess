import tippy from 'tippy.js';
import type { Dispatch } from '@Common/types';
import type { TimeControl } from '@Types';
import {
  type NavBarAction,
  type GameConsoleAction,
  type UserAction,
  setChatTimeout,
  spinnerSearchOneMinute,
  spinnerSearchFiveMinute,
  spinnerSearchFifteenMinute,
  setDisconnectInterval,
  openNewGameMenu
} from '../actions/index';
import { gameCompleteToast, errorToast } from '@Common/toast';
import events from 'events';

type CachedData = 'searching' | 'env-notification';
type CachedDataValues = TimeControl | 'notified';
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
  const whiteDelta = newWhiteRating - ratingWhite;
  const blackDelta = newBlackRating - ratingBlack;
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

export const parsePositionId = (id: string) => {
  return id.replaceAll('/', '_').replaceAll(' ', '_');
};

export const highlightCurrentMoveHistory = (
  currentPosition: string,
  prevPosition?: string
) => {
  if (prevPosition !== undefined) {
    const prevPositionParsed = parsePositionId(prevPosition);
    const nextMove = document.getElementById(prevPositionParsed);
    if (nextMove) {
      nextMove.style.backgroundColor = '';
    }
  }
  const currentPositionParsed = parsePositionId(currentPosition);
  const currentMove = document.getElementById(currentPositionParsed);
  if (currentMove) {
    currentMove.style.backgroundColor = 'honeydew';
  }
};

export const clientDisconnectNotification = (dispatch: Dispatch<UserAction>) => {
  const { DISCONNECT_NOTIFICATION_INTERVAL } = process.env;
  dispatch(
    setDisconnectInterval(
      window.setInterval(() => {
        errorToast('Disconnected from server. Attempting to reconnect ...');
      }, parseInt(DISCONNECT_NOTIFICATION_INTERVAL))
    )
  );
};

export const cacheStateData = (key: CachedData, value: CachedDataValues) => {
  localStorage.setItem(key, value);
};

export const getCacheStateData = (key: CachedData) => {
  return localStorage.getItem(key);
};
export const removeCacheStateData = (key: CachedData) => {
  localStorage.removeItem(key);
};

export const handleCachedData = (dispatch: Dispatch<NavBarAction>) => {
  const searching = <TimeControl>localStorage.getItem('searching');
  if (searching) {
    dispatch(openNewGameMenu(true));
  }
  switch (searching) {
    case '1+0':
      dispatch(spinnerSearchOneMinute(true));
      break;
    case '5+0':
      dispatch(spinnerSearchFiveMinute(true));
      break;
    case '15+0':
      dispatch(spinnerSearchFifteenMinute(true));
      break;
  }
};
