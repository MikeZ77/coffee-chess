import type { Socket, Server as ioServer } from 'socket.io';

export default (io: ioServer, socket: Socket) => {
  const sendUserInfo = (message: string) => {
    console.log(message);
  };

  socket.on('message:user:info', sendUserInfo);
};
