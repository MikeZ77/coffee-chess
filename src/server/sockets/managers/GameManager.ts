import type { Socket, Server as ioServer } from 'socket.io';
import type { RedisClientType } from 'redis';
import type { GameMessage, GameConfirmation, Game, GameAborted } from '@Types';
import type { ShortMove } from 'chess.js';
import { Chess } from 'chess.js';
import { DateTime } from 'luxon';
import Logger from '@Utils/config.logging.winston';
import Manager from './Manager';

const { GAME_ABORT_MS } = process.env;

export default class GameManager extends Manager {
  private getGameInformation = async (
    message: GameMessage,
    gameHandler: Function,
    ack?: Function
  ) => {
    const userSession = this.socket.data.userSession;
    const gameId = await this.redis.json.get(userSession, { path: ['playingGame'] });
    if (gameId) {
      this.socket.data.gameId = gameId;
      this.socket.data.gameSession = `game:${gameId}`;
      this.socket.data.gameRoom = `room:game:${gameId}`;
      ack === undefined ? gameHandler(message) : gameHandler(message, ack);
    }
  };

  // private startGameClock = () => {
  //   setInterval(async () => {

  //   },250)
  // };

  private setGameAbortWatcher = (gameSession: string, gameRoom: string) => {
    setTimeout(
      async () => {
        const {
          state: gameState,
          userWhiteId,
          userBlackId,
          gameId
        } = <Record<string, string>>await this.redis.json.get(gameSession, {
          path: ['state', 'userWhiteId', 'userBlackId', 'gameId']
        });

        let gameAborted;
        if (gameState === 'PENDING') {
          // One player has not sent game confirmation.
          gameAborted = true;
          Logger.debug('Game pending.');
        } // One or both players have not made a move.
        else if (gameState === 'IN_PROGRESS') {
          // TODO: When the timer runs out check if either player has made a move.
          gameAborted = true;
          Logger.debug('Game in progress.');
        } else {
          gameAborted = false;
          Logger.debug('Time expired with no action.');
        }

        if (gameAborted) {
          await this.redis
            .multi()
            .json.set(gameSession, 'state', 'ABORTED')
            .json.set(`user:session:${userWhiteId}`, 'playingGame', null)
            .json.set(`user:session:${userBlackId}`, 'playingGame', null)
            .json.set(`user:session:${userWhiteId}`, 'state', 'IDLE')
            .json.set(`user:session:${userBlackId}`, 'state', 'IDLE')
            .exec();
          const aborted: GameAborted = { aborted: true };
          await this.io.in(gameRoom).emit('message:game:aborted', aborted);
          await this.io.socketsLeave(gameId);
        }
      },
      parseInt(GAME_ABORT_MS),
      gameSession,
      gameRoom
    );
  };

  private constructGameRoom = async (message: GameConfirmation) => {
    /*  
    1. Player confirms their ready status.
    2. Join the player (socket) to the game room
    3. If they are the first player to join the room, set a timeout for game abort.
      CASE 1: When the timer runs out set the game state to ABORTED.
      CASE 2: When the timer runs out check if either player has made a move.
    4. If the second player to joins the room, set the game state to IN_PROGRESS.
    5. Emit to message:game:connected
  */
    Logger.info(`${this.getUserSignature()}: Game ready signal : %o:`, message);
    const { username, userSession, gameSession, gameRoom } = <Record<string, string>>(
      this.socket.data
    );
    await this.socket.join(gameRoom);
    const playersInRoom = await this.io.in(gameRoom).fetchSockets();
    if (playersInRoom.length === 1) {
      this.setGameAbortWatcher(gameSession, gameRoom);
    }

    if (playersInRoom.length === 2) {
      await Promise.all([
        this.redis.json.set(gameSession, 'state', 'IN_PROGRESS'),
        this.redis.json.set(gameSession, 'startTime', DateTime.utc().toString())
      ]);
      // TODO: Add to the list of games players can observe.
    }

    await this.redis.json.set(userSession, 'state', 'PLAYING');
    await this.io
      .in(gameRoom)
      .emit('message:game:connected', { message: `${username} Has conncted.` });
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
    const { userId, gameRoom, gameSession } = <Record<string, string>>this.socket.data;
    const { userWhite, userBlack, state, position } = <Record<string, string>>(
      await this.redis.json.get(gameSession, {
        path: ['userWhite', 'userBlack', 'state', 'position']
      })
    );

    if (state !== 'IN_PROGRESS') {
      return;
    }

    this.chess.load(position!);
    if (
      (userId === userWhite && this.chess.turn() === 'b') ||
      (userId === userBlack && this.chess.turn() === 'w')
    ) {
      return;
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

    await this.redis.json.set(gameSession, 'position', this.chess.fen());
    await this.socket.to(gameRoom).emit('message:game:move', playerMove);
  };

  private chess;
  constructor(io: ioServer, socket: Socket, redis: RedisClientType) {
    super(io, socket, redis);
    this.chess = new Chess();
    socket.on('message:game:ready', (message) =>
      this.getGameInformation(message, this.constructGameRoom)
    );
    socket.on('message:game:move', (message) =>
      this.getGameInformation(message, this.updateGameMove)
    );
  }
}
