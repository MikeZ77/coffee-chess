import type { Socket } from 'socket.io-client';
import type { UserInfo, UserConnected } from '@Types';
import type { ClientGame } from '../state';
import type { SocketActions, UserAction } from '../actions/index';
import type { Dispatch } from '@Common/types';
import type { State } from '../state';
import { Sound } from './simple.utils';
import { playSound } from './simple.utils';
import { updateUserInfo } from '../actions/index';
import { COLOR } from 'cm-chessboard/src/cm-chessboard/Chessboard';
import { initNewGame } from '../actions/index';

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
    if ([userWhite, userBlack].includes(username)) {
      socket.emit('message:game:ready', { ready: true });
      const color = username === userWhite ? COLOR.white : COLOR.black;
      dispatch(initNewGame(message));
      board.setPosition(position, false);
      board.setOrientation(color);
      playSound(Sound.START);
    }
  };

  const gameConnected = (message: UserConnected) => {
    console.log('Game connected', message)
  }

  socket.on('message:game:match', newGameMatch);
  socket.on('message:game:connected', gameConnected);
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
