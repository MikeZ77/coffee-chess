import type { Socket, Server as ioServer } from 'socket.io';
import type { RedisClientType } from 'redis';
import type { Confirmation, GameChat } from '@Types';
import Logger from '@Utils/config.logging.winston';
import Manager from './Manager';

const { GAME_ABORT_MS } = process.env;

export default class GameManager extends Manager {
  private gameWaitingRoom = async (message: Confirmation) => {
    /*  
    1. Player confirms their ready status.
    2. Join the player (socket) to the game room
    3. If they are the first player to join the room, set a timeout for game abort.
      CASE 1: When the timer runs out set the game state to ABORTED.
      CASE 2: When the timer runs out check if either player has made a move.
    4. If they are the second player to join the room, set the game state to IN_PROGRESS.
    5. Emit to message:game:connected
  */
    Logger.info(`Game ready signal ${this.getUserSignature()}: %o:`, message);
    const gameId = await this.redis.json.get(`user:session:${this.userId}`, {
      path: ['$.playingGame']
    });
    const gameRoomId = `room:game:${gameId}`;
    this.socket.join(gameRoomId);
    const playersInRoom = await this.io.in(gameRoomId).fetchSockets();
    if (playersInRoom.length === 1) {
      setTimeout(
        async () => {
          const gameState = await this.redis.json.get(`game:${gameId}`, { path: ['$.state'] });
          if (gameState === 'PENDING') {
            await this.redis.json.set(`game:${gameId}`, '$.state', 'ABORTED');
          } else {
            Logger.info('Time expired with no action.');
          }
          //TODO: Check if either player has made a move.
          // Set users back to IDLE and playingGame to null
          // Send notifications that game has been aborted.
        },
        parseInt(GAME_ABORT_MS),
        gameId
      );
    }
    if (playersInRoom.length === 2) {
      await this.redis.json.set(`game:${gameId}`, '$.state', 'IN_PROGRESS');
    }
    await this.redis.json.set(`user:session:${this.userId}`, '$.state', 'PLAYING');
    await this.io
      .in(gameRoomId)
      .emit('message:game:connected', <GameChat>{ message: `${this.username} Has conncted.` });
  };

  private updateGameMove = (message: string) => {
    console.log(message);
  };

  constructor(io: ioServer, socket: Socket, redis: RedisClientType) {
    super(io, socket, redis);
    socket.on('message:game:ready', this.gameWaitingRoom);
    socket.on('message:game:move', this.updateGameMove);
  }
}
