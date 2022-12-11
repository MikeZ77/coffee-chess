import type { Socket, Server as ioServer } from 'socket.io';
import type { RedisClientType } from 'redis';
import type { UserInfo } from '@Types';
import Manager from './Manager';

export default class UserManager extends Manager {
  static sendUserInfo = (socket: Socket) => {
    const message: UserInfo = {
      userId: socket.data.userId,
      username: socket.data.username
    };
    socket.emit('message:user:info', message);
  };

  constructor(io: ioServer, socket: Socket, redis: RedisClientType) {
    super(io, socket, redis);
  }
}
