import type { Socket } from 'socket.io-client';
import type { Game, UserInfo } from '@Types';
import type { SocketActions } from '../actions/index';
import type { Dispatch } from '@Common/types';
import { updateUserInfo } from '../actions/index';

export default (socket: Socket, dispatch: Dispatch<SocketActions>) => {
  const newGame = (newGame: Game) => {
    console.log(newGame);
    // socket.on('game:match', currentGame('gameRoomId'));
  };

  const currentGame = (message: Game) => {
    console.log('Break');
  };

  const userInfo = (message: UserInfo) => {
    console.log('message', message);
    dispatch(updateUserInfo(message));
  };

  socket.on('message:game:match', newGame);
  socket.on('message:game', currentGame);
  socket.on('message:user:info', userInfo);
};
