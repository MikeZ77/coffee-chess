import tippy from 'tippy.js';
import type { Dispatch } from '@Common/types';
import {
  type NavBarAction,
  spinnerSearchOneMinute,
  spinnerSearchFiveMinute,
  spinnerSearchFifteenMinute
} from '../actions/index';

interface Tooltip {
  [key: string]: string;
}

export const initTooltipAttributes = (tooltipInfo: Tooltip): void => {
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
