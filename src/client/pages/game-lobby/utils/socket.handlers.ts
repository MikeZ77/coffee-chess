import type { Socket } from 'socket.io-client';
import type { UserInfo, GameChat } from '@Types';
import type { ClientGame } from '../state';
import type { SocketActions, UserAction } from '../actions/index';
import type { Dispatch } from '@Common/types';
import type { State } from '../state';
import { Sound } from './simple.utils';
import { playSound } from './simple.utils';
import { updateUserInfo } from '../actions/index';
import { COLOR } from 'cm-chessboard/src/cm-chessboard/Chessboard';
import { attachInputHandler } from './chessboard';
import { initNewGame, updateChatLog, setPlayerColor } from '../actions/index';

// prettier-ignore
// @ts-ignore
export const registerGameEvents = (socket: Socket, dispatch: Dispatch<SocketActions>, board) => {

  const newGameMatch = (message: ClientGame) => {
    /*
      If we see a matching game:
        1. Confirm that we saw the message and are ready by emitting to message:game:ready 
        2. Setup the board.
    */ 
    const state = <State>dispatch();
    const { username } = state;
    const { userWhite, userBlack, position } = message;
    console.log('state', state)
    if ([userWhite, userBlack].includes(username)) {
      socket.emit('message:game:ready', { ready: true });
      const color = username === userWhite ? COLOR.white : COLOR.black;
      dispatch(initNewGame(message));
      dispatch(setPlayerColor(color))
      board.setPosition(position, false);
      board.setOrientation(color);
      // playSound(Sound.START);
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
    dispatch(updateChatLog(message))
    board.enableMoveInput(attachInputHandler, color);
  }

  const opponentMove = (message: ClientGame) => {
    console.log(message)
  }

  socket.on('message:game:match', newGameMatch);
  socket.on('message:game:connected', gameConnected);
  socket.on('message:game:move', opponentMove);
};

export const registerUserEvents = (socket: Socket, dispatch: Dispatch<UserAction>) => {
  const userInfo = (message: UserInfo) => {
    dispatch(updateUserInfo(message));
  };

  const userNotification = (message: string) => {
    console.log('Notification', message);
  };

  socket.on('message:user:info', userInfo);
  socket.on('message:user:notification', userNotification);
};
