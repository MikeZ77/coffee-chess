import type { Socket } from 'socket.io-client';
import type { InitGameMessage, Game } from '@Types';

export default (socket: Socket) => {
  const listenForNewGame = (message: InitGameMessage) => {
    console.log('Break');
    // socket.on('game:match', currentGame('gameRoomId'));
  };

  const listenToCurrentGame = (message: Game) => {
    console.log('Break');
  };

  socket.on('game:match', listenForNewGame);
  socket.on('game', listenToCurrentGame);
};
