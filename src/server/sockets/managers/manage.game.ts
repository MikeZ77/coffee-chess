import type { Socket, Server as ioServer } from 'socket.io';
import type { RedisClientType } from 'redis';
import type { Confirmation } from '@Types';

export default (io: ioServer, socket: Socket, redis: RedisClientType) => {
  const gameWaitingRoom = (message: Confirmation) => {
    /*  
    1. Player confirms their ready status.
    2. If they are the first player to join the room, set a timeout for game abort.
      CASE 1: When the timer runs out and there is only one player socket in the room, then ABORT.
      CASE 2: When the timer runs out and both player sockets are in the room, then do nothing.
    3. If they are the second player to join the room, set the game state to IN_PROGRESS.
    4. Join the player (socket) to the game room
    5. Emit to message:game:connected
  */
    console.log(message);
  };

  const updateGameMove = (message: string) => {
    console.log(message);
  };

  socket.on('message:game:ready', gameWaitingRoom);
  socket.on('message:game:move', updateGameMove);
};
