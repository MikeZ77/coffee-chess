// @ts-nocheck

import type { GameClock } from '@Types';
import type { GameAction } from '../actions/index';
import type { State } from '../state';
import { updatePlayerTime } from '../actions/index';
import { PromotionDialog } from 'cm-chessboard/src/cm-chessboard/extensions/promotion-dialog/PromotionDialog';
import { DateTime } from 'luxon';
import Chess from 'chess.js';

const { CLIENT_GAME_CLOCK_TICK_MS } = process.env;
const chess = new Chess();

export const boardConfig = {
  position: chess.fen(),
  responsive: true,
  sprite: {
    url: '2807878831d82b261a27.svg'
  },
  style: {
    aspectRatio: 1,
    moveFromMarker: undefined,
    moveToMarker: undefined
  },
  extensions: [{ class: PromotionDialog, props: {} }]
};

export class ClientClock {
  private startTime;
  private whiteInterval;
  private blackInterval;
  constructor() {
    this.startTime = null;
    this.whiteInterval = null;
    this.blackInterval = null;
  }

  public startWhiteClock = (dispatch: Dispatch<GameAction>) => {
    clearInterval(this.blackInterval);
    this.whiteInterval = setInterval(() => {
      const state = <State>dispatch();
      const { whiteTime, blackTime } = state.currentGame;
      const endTime = DateTime.now();
      const delta = endTime.diff(this.startTime, ['milliseconds']);
      const time: GameClock = { whiteTime: whiteTime - delta, blackTime };
      dispatch(updatePlayerTime(time));
      this.startTime = endTime;
    }, CLIENT_GAME_CLOCK_TICK_MS);
  };

  public startBlackClock = (dispatch: Dispatch<GameAction>) => {
    if (!this.startTime) {
      this.startTime = DateTime.now();
    }
    clearInterval(this.whiteInterval);
    this.blackInterval = setInterval(() => {
      const state = <State>dispatch();
      const { whiteTime, blackTime } = state.currentGame;
      const endTime = DateTime.now();
      const delta = endTime.diff(this.startTime, ['milliseconds']);
      const time: GameClock = { whiteTime, blackTime: blackTime - delta };
      dispatch(updatePlayerTime(time));
      this.startTime = endTime;
    }, CLIENT_GAME_CLOCK_TICK_MS);
  };

  public stopClocks = () => {
    if (this.whiteInterval) {
      clearInterval(this.whiteInterval);
    }
    if (this.blackInterval) {
      clearInterval(this.blackInterval);
    }
  };
}
