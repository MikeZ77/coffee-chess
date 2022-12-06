import type { Socket, Server as ioServer } from 'socket.io';

export default class GameManager {
  private io;
  private socket;
  constructor(io: ioServer, socket: Socket) {
    this.io = io;
    this.socket = socket;
    socket.on('message:game:start', this.startGame);
  }

  startGame = (message: string) => {
    console.log(message);
  };
}
