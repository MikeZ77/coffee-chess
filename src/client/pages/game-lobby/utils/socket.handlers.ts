import type { Socket } from 'socket.io-client';

export default (socket: Socket) => {
  const registerListenNewGame = () => {
    console.log('Break');
  };

  socket.on('game:match', registerListenNewGame);
};
