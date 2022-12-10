import type { Socket, Server as ioServer } from 'socket.io';
import type { RedisClientType } from 'redis';
import type { Confirmation, GameChat, Game } from '@Types';
import type { ShortMove } from 'chess.js';
import { Chess } from 'chess.js';
import Logger from '@Utils/config.logging.winston';
import Manager from './Manager';

const { GAME_ABORT_MS } = process.env;

export default class GameManager extends Manager {
  private constructGameRoom = async (message: Confirmation) => {
    /*  
    1. Player confirms their ready status.
    2. Join the player (socket) to the game room
    3. If they are the first player to join the room, set a timeout for game abort.
      CASE 1: When the timer runs out set the game state to ABORTED.
      CASE 2: When the timer runs out check if either player has made a move.
    4. If the second player to joins the room, set the game state to IN_PROGRESS.
    5. Emit to message:game:connected
  */
    Logger.info(`Game ready signal ${this.getUserSignature()}: %o:`, message);
    const gameId = <string>await this.redis.json.get(`user:session:${this.userId}`, {
      path: ['$.playingGame']
    });
    const gameRoomId = `room:game:${gameId}`;
    await this.socket.join(gameRoomId);
    const playersInRoom = await this.io.in(gameRoomId).fetchSockets();
    if (playersInRoom.length === 1) {
      setTimeout(
        async () => {
          const gameState = await this.redis.json.get(`game:${gameId}`, { path: ['$.state'] });
          if (gameState === 'PENDING') {
            await this.redis.json.set(`game:${gameId}`, '$.state', 'ABORTED');
          } else {
            Logger.debug('Time expired with no action.');
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
      // Set startTime
    }
    // TODO: Add to the list of games players can observe.
    this.gameId = gameId;
    this.gameRoomId = gameRoomId;
    await this.redis.json.set(`user:session:${this.userId}`, '$.state', 'PLAYING');
    await this.io
      .in(gameRoomId)
      .emit('message:game:connected', <GameChat>{ message: `${this.username} Has conncted.` });
  };

  private updateGameMove = async (playerMove: ShortMove) => {
    /*
    Relays the move and updates the game state.
    1. Validate that the user is making a move for their turn.
    2. Validate the move (.move(move, [ options ])).
      CASE 1: If it is the first move then start the game clock.
    3. Update the game clock.
    4. Check if the game is over (checkmate, stalemate, draw, threefold repetition, or insufficient material)
  */
    if (!this.gameId) {
      return;
    }

    const { userWhite, userBlack, state, position } = <Partial<Game>>await this.redis.json.get(
      `game:${this.gameId}`,
      {
        path: ['userWhite', 'userBlack', 'state', 'position']
      }
    );
    this.chess.load(position!);

    if (
      (this.userId === userWhite && this.chess.turn() === 'b') ||
      (this.userId === userBlack && this.chess.turn() === 'w')
    ) {
      return;
    }

    if (state === 'ABORTED') {
      console.log();
      // Emit to players
      // Remove game from state
      // Delete room
      // Send clint notification
    }

    const move = this.chess.move(playerMove);
    if (!move) {
      return;
    }

    if (this.chess.history().length === 1) {
      console.log();
      // Init start the clock ticks for black
    } else {
      console.log();
      // Init the clock ticks for the opponent.
    }

    if (this.gameRoomId) {
      await this.redis.json.set(`game:${this.gameId}`, 'position', this.chess.fen());
      await this.socket.to(this.gameRoomId).emit('message:game:move', playerMove);
    }
  };

  private chess;
  private gameId: string | null;
  private gameRoomId: string | null;
  constructor(io: ioServer, socket: Socket, redis: RedisClientType) {
    super(io, socket, redis);

    this.chess = new Chess();
    this.gameId = null;
    this.gameRoomId = null;
    this.userId = socket.data.userId;

    socket.on('message:game:ready', this.constructGameRoom);
    socket.on('message:game:move', this.updateGameMove);
  }
}
