import type { Socket } from 'socket.io-client';
import type {
  UserInfo,
  GameChat,
  GameConfirmation,
  GameAborted,
  GameClock,
  GameMove
} from '@Types';
import type { ClientGame } from '../state';
import type { UserAction, AnyActions } from '../actions/index';
import type { Dispatch } from '@Common/types';
import type { State } from '../state';
import { DateTime } from 'luxon';
import { clearQueueSpinners } from './simple.utils';
import { ClientClock } from './chess';
import { warningToast } from '@Common/toast';
import Chess from 'chess.js';
import { updateUserInfo, updatePlayerTime } from '../actions/index';
import { initNewGame, updateChatLog, setPlayerColor } from '../actions/index';
import {
  INPUT_EVENT_TYPE,
  MARKER_TYPE,
  COLOR
} from 'cm-chessboard/src/cm-chessboard/Chessboard';

const { GAME_CLOCK_SERVER_SYNC_MS } = process.env;

export const registerGameEvents = (
  socket: Socket,
  dispatch: Dispatch<AnyActions, State>,
  // @ts-ignore
  board
) => {
  const newGameMatch = (message: ClientGame) => {
    /*
      If we see a matching game:
        1. Confirm that we saw the message and are ready by emitting to message:game:ready 
        2. Setup the board.
    */
    const state = <State>dispatch();
    const { username } = state;
    const { userWhite, userBlack, position } = message;
    if ([userWhite, userBlack].includes(username)) {
      socket.emit('message:game:ready', <GameConfirmation>{ ready: true });
      const color = username === userWhite ? COLOR.white : COLOR.black;
      dispatch(initNewGame(message));
      dispatch(setPlayerColor(color));
      clearQueueSpinners(dispatch);
      board.setPosition(position, false);
      board.setOrientation(color);
    }
  };

  // @ts-ignore
  const attachBoardInputHandler = (event) => {
    event.chessboard.removeMarkers(MARKER_TYPE.dot);
    if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
      const moves = chess.moves({ square: event.square, verbose: true });
      for (const move of moves) {
        event.chessboard.addMarker(MARKER_TYPE.dot, move.to);
      }
      return moves.length > 0;
    }
    if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
      const result = chess.move({ from: event.squareFrom, to: event.squareTo });
      //TODO: If its not the users turn then do not return.
      if (result) {
        const gameMove: GameMove = {
          from: result.from,
          to: result.to,
          timestampUtc: DateTime.utc().toString()
        };
        socket.emit('message:game:move', gameMove);
        chess.turn() === 'w'
          ? clock.startWhiteClock(dispatch)
          : clock.startBlackClock(dispatch);
        return result;
      }
    }
  };

  const gameConnected = (message: GameChat) => {
    /*
      Game is not IN_PROGRESS and we can make moves.
        1. Add the player connected server message to the game chat log.
        2. Enable the board.
    */
    const state = <State>dispatch();
    const { color } = state.currentGame;
    dispatch(updateChatLog(message));
    board.enableMoveInput(attachBoardInputHandler, color);
    // playSound(Sound.START);
  };

  const opponentMove = (move: GameMove) => {
    const { from, to } = move;
    board.movePiece(from, to, true);
    chess.move({ from, to });
    chess.turn() === 'w' ? clock.startWhiteClock(dispatch) : clock.startBlackClock(dispatch);
  };

  const gameAborted = (message: GameAborted) => {
    if (message.aborted) {
      dispatch(updateChatLog({ username: undefined, message: 'ABORTED' }));
      warningToast('Game aborted. Opponent failed to connect.');
      board.disableMoveInput();
      chess.reset();
      // Play end game sound.
    }
  };

  const syncWithServerClock = (clock: GameClock) => {
    const { whiteTime, blackTime, timestampUtc } = clock;
    const startTime = DateTime.fromISO(timestampUtc!);
    const currentTime = DateTime.utc();
    const latency = currentTime.diff(startTime, ['milliseconds']).milliseconds;
    const state = <State>dispatch();
    const whiteServerTime = whiteTime + latency;
    const blackServerTime = blackTime + latency;
    const whiteClientTime = <number>state.currentGame.whiteTime;
    const blackClientTime = <number>state.currentGame.blackTime;
    const syncDelta = parseInt(GAME_CLOCK_SERVER_SYNC_MS);

    // console.log('White', Math.abs(whiteServerTime - whiteClientTime));
    // console.log('Black', Math.abs(blackServerTime - blackClientTime));

    if (Math.abs(whiteServerTime - whiteClientTime) > syncDelta) {
      const time: GameClock = {
        whiteTime: whiteServerTime,
        blackTime: blackClientTime
      };
      dispatch(updatePlayerTime(time));
    }

    if (Math.abs(blackServerTime - blackClientTime) > syncDelta) {
      const time: GameClock = {
        whiteTime: whiteClientTime,
        blackTime: blackServerTime
      };
      dispatch(updatePlayerTime(time));
    }
  };

  // @ts-ignore
  const chess = new Chess();
  const clock = new ClientClock();
  socket.on('message:game:match', newGameMatch);
  socket.on('message:game:connected', gameConnected);
  socket.on('message:game:move', opponentMove);
  socket.on('message:game:aborted', gameAborted);
  socket.on('message:game:clock', syncWithServerClock);
};

export const registerUserEvents = (socket: Socket, dispatch: Dispatch<UserAction>) => {
  const userInfo = (message: UserInfo) => {
    dispatch(updateUserInfo(message));
  };

  const userNotification = (message: string) => {
    console.log('Notification', message);
  };

  const userPing = (pong: Function) => pong();

  socket.on('message:user:info', userInfo);
  socket.on('message:user:ping', userPing);
  socket.on('message:user:notification', userNotification);
};
