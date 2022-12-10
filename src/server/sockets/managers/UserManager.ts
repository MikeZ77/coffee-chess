import type { Socket, Server as ioServer } from 'socket.io';
import type { RedisClientType } from 'redis';
import type { UserInfo } from '@Types';
import Manager from './Manager';

// export default (io: ioServer, socket: Socket) => {
//   const sendUserInfo = (message: string) => {
//     console.log(message);
//   };

//   socket.on('message:user:info', sendUserInfo);
// };

export default class UserManager extends Manager {
  public sendUserInfo = () => {
    const message: UserInfo = {
      userId: this.socket.data.userId,
      username: this.socket.data.username
    };
    this.socket.emit('message:user:info', message);
  };

  constructor(io: ioServer, socket: Socket, redis: RedisClientType) {
    super(io, socket, redis);
    // socket.on('message:user:info', this.sendUserInfo);
  }
}
