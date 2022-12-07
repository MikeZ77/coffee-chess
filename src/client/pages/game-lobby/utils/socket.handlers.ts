import type { Socket } from 'socket.io-client';
import type { Game, UserInfo } from '@Types';
import type { SocketActions, UserAction } from '../actions/index';
import type { Dispatch } from '@Common/types';
import type { State } from '../state';
import { updateUserInfo } from '../actions/index';
import { COLOR } from 'cm-chessboard/src/cm-chessboard/Chessboard';

// prettier-ignore
// @ts-ignore
export const registerGameEvents = (socket: Socket, dispatch: Dispatch<SocketActions>, board) => {
  const newGameMatch = (message: Game) => {
    const state = <State>dispatch();
    const { username } = state;
    const { userWhite, userBlack } = message;
    if ([message.userWhite, message.userBlack].includes(state.username)) {
      const color = username === userWhite ? COLOR.white : COLOR.black;
      board.setOrientation(color);
    }
    // 1. Setup the board
    // 2. Emit message:game:ready
    socket.emit('message:game:ready', { ready: true });
  };

  socket.on('message:game:match', newGameMatch);
};

export const registerUserEvents = (socket: Socket, dispatch: Dispatch<UserAction>) => {
  const userInfo = (message: UserInfo) => {
    dispatch(updateUserInfo(message));
  };

  socket.on('message:user:info', userInfo);
};
