import type { Socket, Server as ioServer } from 'socket.io';
import type { RedisClientType } from 'redis';
import type {
  GameMessage,
  GameConfirmation,
  GameMove,
  GameAborted,
  GameClock,
  GameDrawOffer,
  GameComplete,
  GameHistory,
  Result,
  ResultReason,
  GameResign,
  GameChat
} from '@Types';
import type { ShortMove } from 'chess.js';
import { Chess } from 'chess.js';
import { DateTime } from 'luxon';
import Filter from 'bad-words';
import calculateUpdatedEloRating from '../../utils/elo.calculator';
import Logger from '@Utils/config.logging.winston';
import Manager from './Manager';

const {
  GAME_ABORT_MS,
  GAME_CLOCK_TICK_MS,
  MAX_MOVE_CORRECTION_LATENCY_MS,
  GAME_CHAT_TIMEOUT_SEC
} = process.env;

export default class GameManager extends Manager {
  private trackGame = async (message: GameMessage, gameHandler: Function, ack?: Function) => {
    const userSession = this.socket.data.userSession;
    const gameId = await this.redis.json.get(userSession, { path: ['playingGame'] });
    if (gameId) {
      this.socket.data.gameId = gameId;
      this.socket.data.gameSession = `game:${gameId}`;
      this.socket.data.gameRoom = `room:game:${gameId}`;
      ack === undefined ? gameHandler(message) : gameHandler(message, ack);
    }
  };

  private startGameClock = (gameSession: string, gameRoom: string) => {
    const interval = parseInt(GAME_CLOCK_TICK_MS);
    this.startTime = DateTime.now();
    this.clockInterval = setInterval(
      async () => {
        const { state, position, whiteTime, blackTime } = <
          { state: string; position: string; whiteTime: number; blackTime: number }
        >await this.redis.json.get(gameSession, {
          path: ['state', 'position', 'whiteTime', 'blackTime']
        });

        if (state === 'ABORTED') {
          clearInterval(<number>this.clockInterval);
        }

        if (state === 'COMPLETE') {
          clearInterval(<number>this.clockInterval);
        }

        const chess = new Chess(position);
        const endTime = DateTime.now();
        const delta = endTime.diff(<DateTime>this.startTime, ['milliseconds']).milliseconds;
        // Logger.debug('delta %o', delta);
        if (state === 'IN_PROGRESS') {
          if (chess.turn() === 'w') {
            if (whiteTime - delta <= 0) {
              // clearInterval and call function to:
              // Set game state to COMPLETE
              // Send game result to client
              // Call function to store game
              // Destroy game room
              Logger.info('White time up');
            } else {
              const clock: GameClock = {
                whiteTime: whiteTime - delta,
                blackTime,
                timestampUtc: DateTime.utc().toString()
              };
              // Logger.info(' White: %o', clock);
              await Promise.all([
                this.redis.json.numIncrBy(gameSession, 'whiteTime', -delta),
                this.io.in(gameRoom).emit('message:game:clock', clock)
              ]);
            }
          } else {
            if (blackTime - delta <= 0) {
              Logger.info('Black time up');
            } else {
              const clock: GameClock = {
                whiteTime,
                blackTime: blackTime - delta,
                timestampUtc: DateTime.utc().toString()
              };
              // Logger.info('Black: %o', clock);
              await Promise.all([
                this.redis.json.numIncrBy(gameSession, 'blackTime', -delta),
                this.io.in(gameRoom).emit('message:game:clock', clock)
              ]);
            }
          }
        }
        this.startTime = endTime;
      },
      interval,
      gameSession,
      gameRoom
    );
  };

  private setGameAbortWatcher = (
    gameSession: string,
    gameRoom: string,
    color: 'WHITE' | 'BLACK'
  ) => {
    setTimeout(
      async () => {
        const {
          state: gameState,
          userWhiteId,
          userBlackId,
          gameId,
          history
        } = <Record<string, string>>await this.redis.json.get(gameSession, {
          path: ['state', 'userWhiteId', 'userBlackId', 'gameId', 'history']
        });

        let gameAborted = false;
        if (gameState === 'PENDING') {
          // One player has not sent game confirmation.
          gameAborted = true;
          Logger.debug('Game pending.');
        } // One or both players have not made a move.
        else if (gameState === 'IN_PROGRESS') {
          if (color === 'WHITE') {
            if (history.length === 0) {
              gameAborted = true;
            }
          }
          if (color === 'BLACK') {
            if (history.length === 1) {
              gameAborted = true;
            }
          }
        } else {
          Logger.debug('Abort time expired with no action.');
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
    Logger.debug(gameSession);
    Logger.debug(gameRoom);
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
    if (playersInRoom[0].data.userId === this.userId) {
      // The first player in the room sets the game abort watcher.
      this.setGameAbortWatcher(gameSession, gameRoom, 'WHITE');
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

  private updateGameMove = async (gameMove: GameMove) => {
    /*
    Relays the move and updates the game state.
    1. Validate that the user is making a move for their turn.
    2. Validate the move (.move(move, [ options ])).
      CASE 1: If it is the first move then start the game clock.
    3. Update the game clock.
    4. Check if the game is over (checkmate, stalemate, draw, threefold repetition, or insufficient material)
  */
    Logger.debug('gameMove %o', gameMove);
    const endTime = DateTime.utc();
    const maxMoveLatency = parseInt(MAX_MOVE_CORRECTION_LATENCY_MS);
    const { timestampUtc, ...playerMove } = gameMove;
    const { userId, gameRoom, gameSession } = <Record<string, string>>this.socket.data;
    const { userWhiteId, userBlackId, state, position, history } = <
      {
        userWhiteId: string;
        userBlackId: string;
        state: string;
        position: string;
        history: GameHistory[];
      }
    >await this.redis.json.get(gameSession, {
      path: ['userWhiteId', 'userBlackId', 'state', 'position', 'history']
    });

    if (state !== 'IN_PROGRESS') {
      return;
    }

    if (
      !(typeof timestampUtc === 'string') ||
      !DateTime.fromISO(timestampUtc).isValid ||
      !(endTime.diff(DateTime.fromISO(timestampUtc), ['milliseconds']).milliseconds >= 0)
    ) {
      return;
    }

    const _chess = new Chess(position);
    if (
      ![userWhiteId, userBlackId].includes(userId) ||
      (userId === userWhiteId && _chess.turn() === 'b') ||
      (userId === userBlackId && _chess.turn() === 'w')
    ) {
      return;
    }

    if (history.length) {
      const { from: prevFrom, to: prevTo } = <GameHistory>history.pop();
      this.chess.move(<ShortMove>{ from: prevFrom, to: prevTo });
    }

    const move = this.chess.move(<ShortMove>playerMove);
    if (!move) {
      return;
    }

    //TODO: Handle promotions.
    if (this.chess.in_checkmate()) {
      // Set game state to COMPLETE (clock will clear).
      // Set result to BLACK or WHITE.
      // Call function to compute elo change and store game.
      // Send checkmate gameStatusNotification to clients.
      const { color } = move;
      const result = color === 'w' ? 'WHITE' : 'BLACK';
      await this.handleGameCompletion(result, 'CHECKMATE', <ShortMove>playerMove);
    } else if (
      this.chess.in_draw() ||
      this.chess.in_stalemate() ||
      this.chess.in_threefold_repetition()
    ) {
      await this.handleGameCompletion('DRAW', 'DRAW', <ShortMove>playerMove);
    } else {
      const { from, to, color } = move;
      const nextPosition = this.chess.fen();
      const sentTime = DateTime.fromISO(timestampUtc);
      const colorTurn = color === 'w' ? 'whiteTime' : 'blackTime';
      const delta = endTime.diff(sentTime, ['milliseconds']).milliseconds;
      Logger.debug('playerMove %o', playerMove);
      await Promise.all([
        delta > maxMoveLatency
          ? this.redis.json.numIncrBy(gameSession, colorTurn, maxMoveLatency)
          : this.redis.json.numIncrBy(gameSession, colorTurn, delta),
        this.redis.json.set(gameSession, 'position', this.chess.fen()),
        this.redis.json.set(gameSession, 'pendingDrawOfferFrom', null),
        this.redis.json.arrAppend(gameSession, 'history', {
          from,
          to,
          position: nextPosition
        }),
        this.socket.to(gameRoom).emit('message:game:move', playerMove)
      ]);

      if (this.chess.history().length === 1) {
        // White starts the clock and sets the game abort watcher for black.
        this.startGameClock(gameSession, gameRoom);
        this.setGameAbortWatcher(gameSession, gameRoom, 'BLACK');
      }
    }
  };

  private handleGameCompletion = async (
    result: Result,
    resultType: ResultReason,
    playerMove?: ShortMove
  ) => {
    const { gameRoom, gameSession } = <Record<string, string>>this.socket.data;
    const { ratingBlack, ratingWhite, userWhiteId, userBlackId } = <Record<string, number>>(
      await this.redis.json.get(gameSession, {
        path: ['ratingBlack', 'ratingWhite', 'userWhiteId', 'userBlackId']
      })
    );
    const { newWhiteRating, newBlackRating } = calculateUpdatedEloRating(
      ratingWhite,
      ratingBlack,
      result,
      50 // Get number of player games, hardcoded for now non-provisional for now.
    );

    // TODO: Send rating update to the DB.
    const whiteUserSession = `user:session:${userWhiteId}`;
    const blackUserSession = `user:session:${userBlackId}`;
    const newWhiteRatingRounded = Math.round(newWhiteRating);
    const newBlackRatingRounded = Math.round(newBlackRating);

    await Promise.all([
      this.redis.json.set(gameSession, 'state', 'COMPLETE'),
      this.redis.json.set(gameSession, 'result', result),
      this.redis.json.set(whiteUserSession, 'state', 'IDLE'),
      this.redis.json.set(whiteUserSession, 'playingGame', null),
      this.redis.json.set(blackUserSession, 'state', 'IDLE'),
      this.redis.json.set(blackUserSession, 'playingGame', null),
      playerMove
        ? this.socket.to(gameRoom).emit('message:game:move', playerMove)
        : Promise.resolve(),
      this.io.in(gameRoom).emit('message:game:complete', <GameComplete>{
        type: resultType,
        newWhiteRating: newWhiteRatingRounded,
        newBlackRating: newBlackRatingRounded,
        result
      })
    ]);
  };

  private handleDrawOffer = async (offer: GameDrawOffer) => {
    const { userId, gameRoom, gameSession } = <Record<string, string>>this.socket.data;
    const { pendingDrawOfferFrom, userWhiteId, userBlackId } = <Record<string, string>>(
      await this.redis.json.get(gameSession, {
        path: ['pendingDrawOfferFrom', 'userWhiteId', 'userBlackId']
      })
    );

    if (![userWhiteId, userBlackId].includes(userId)) {
      return;
    }

    if (!pendingDrawOfferFrom) {
      await Promise.all([
        this.socket.to(gameRoom).emit('message:game:draw:offer', <GameDrawOffer>offer),
        this.redis.json.set(gameSession, 'pendingDrawOfferFrom', userId)
      ]);
    }
  };

  private handleAcceptDrawOffer = async (offer: GameDrawOffer) => {
    /* 
      1. Check that the user accepting the draw is the user who was offered the draw.
      TODO: Go through the "end game" steps.
    */
    Logger.debug('Accepted draw offer %o', offer);
    const { userId, gameRoom, gameSession } = <Record<string, string>>this.socket.data;
    Logger.debug('clock interval', this.clockInterval === null);
  };

  private handleResignation = async (message: GameResign) => {
    const { userId, gameSession } = <Record<string, string>>this.socket.data;
    const { userWhiteId, userBlackId } = <Record<string, string>>await this.redis.json.get(
      gameSession,
      {
        path: ['userWhiteId', 'userBlackId']
      }
    );

    if (![userWhiteId, userBlackId].includes(userId)) {
      return;
    }

    const result = userId === userWhiteId ? 'BLACK' : 'WHITE';
    this.handleGameCompletion(result, 'RESIGN');
  };

  private broadcastGameChat = async (message: string) => {
    const { userId, username, gameSession, gameRoom } = <Record<string, string>>(
      this.socket.data
    );
    const { userWhiteId, userBlackId } = <Record<string, string>>await this.redis.json.get(
      gameSession,
      {
        path: ['userWhiteId', 'userBlackId']
      }
    );

    if (![userWhiteId, userBlackId].includes(userId)) {
      return;
    }

    if (!(await this.redis.exists(`chat:game:timeout:${userId}`))) {
      await this.redis.set(`chat:game:timeout:${userId}`, gameSession, {
        EX: parseInt(GAME_CHAT_TIMEOUT_SEC)
      });
      // TODO: Include timestamp on GameChat to limit rate of messages.
      this.io.in(gameRoom).emit('message:game:chat', <GameChat>{
        username,
        message: this.chatFilter.clean(message)
      });
    }
  };

  private chess;
  private chatFilter;
  private startTime: DateTime | null;
  private clockInterval: number | null;
  constructor(io: ioServer, socket: Socket, redis: RedisClientType) {
    super(io, socket, redis);
    this.chess = new Chess();
    this.chatFilter = new Filter();
    this.startTime = null;
    this.clockInterval = null;

    socket.on('message:game:ready', (message) =>
      this.trackGame(message, this.constructGameRoom)
    );
    socket.on('message:game:draw:offer', (message) =>
      this.trackGame(message, this.handleDrawOffer)
    );
    socket.on('message:game:draw:accept', (message) =>
      this.trackGame(message, this.handleAcceptDrawOffer)
    );
    socket.on('message:game:resign', (message) =>
      this.trackGame(message, this.handleResignation)
    );
    socket.on('message:game:chat', (message) =>
      this.trackGame(message, this.broadcastGameChat)
    );
    socket.on('message:game:move', (message) => this.trackGame(message, this.updateGameMove));
  }
}
