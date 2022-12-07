import type { Socket } from 'socket.io';
import type { UserInfo } from '@Types';

export default (socket: Socket) => {
  const message: UserInfo = { userId: socket.data.userId, username: socket.data.username };
  socket.emit('message:user:info', message);
};
