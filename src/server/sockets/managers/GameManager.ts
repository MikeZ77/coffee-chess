import type { Socket, Server as ioServer } from 'socket.io';
import type { RedisClientType } from 'redis';
import sql, { type ConnectionPool } from 'mssql';
import {
  type GameMessage,
  type GameConfirmation,
  type GameMove,
  type GameAborted,
  type GameClock,
  type GameComplete,
  type GameHistory,
  type Result,
  type ResultReason,
  type GameChat,
  type RedisJSON,
  isUserSession,
  isGame,
  isGameInProgress,
  isGamePending
} from '@Types';
import type { ShortMove } from 'chess.js';
import { Chess } from 'chess.js';
import { DateTime } from 'luxon';
import Filter from 'bad-words';
import { SocketError } from '@Utils/custom.errors';
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
  /* 
    GameManager is responsible for managing all sockets that are connected to a game. This includes
    but is not limited to handling player moves, player time, game logic and game state.
  */
  private trackGame = async (message: GameMessage, gameHandler: Function, ack?: Function) => {
    /*  
    Entry point and error handling for socket handlers.
      1. Get socket data. If undefined get this information from game state.
      2. Call the game handler and handle handle its errors if it throws and exception.
    */
    try {
      const userSession = this.socket.data.userSession;
      const { gameId, gameSession, gameRoom } = this.socket.data;
      if ([gameId, gameSession, gameRoom].includes(undefined)) {
        const gameId = await this.redis.json.get(userSession, { path: ['playingGame'] });
        this.socket.data.gameId = gameId;
        this.socket.data.gameSession = `game:${gameId}`;
        this.socket.data.gameRoom = `room:game:${gameId}`;
      }
      ack === undefined ? await gameHandler(message) : await gameHandler(message, ack);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Logger.error(`${this.getUserSignature()}: %o`, error.stack);
      }
      if (error instanceof SocketError) {
        const [user, game] = await this.getRedisStateOnError();
        if (error.details) {
          Logger.error(`${this.getUserSignature()}: %o`, error.details);
        }
        if (isUserSession(user)) {
          Logger.info(`${this.getUserSignature()}::userstate: %o`, user);
        }
        if (isGame(game)) {
          Logger.info(`${this.getUserSignature()}::gamestate: %o`, game);
        }
      }
    }
  };

  private startGameClock = (gameSession: string, gameRoom: string) => {
    /*
      1. Set a new start time for the current tick.
      2. If the game state is in ABORTED or COMPLETE then clear the interval (stop the clock).
      3. If the game state is IN_PROGRESS compute the delta (change) that has occured since the last clock tick
         using the start and end time.
        CASE 1: It is whites turn:
          1. Decrement whites time by delta.
          2. If white is out of time call handleGameCompletion with result BLACK.
        CASE 2: It is blacks turn:
          1. Decrement blacks time by delta.
          2. If white is out of time call handleGameCompletion with result WHITE.
      4. Send the updated time to any client in the game room.
      5. Set the new end time as the current start time.
    */
    const interval = parseInt(GAME_CLOCK_TICK_MS);
    this.startTime = DateTime.now();
    this.clockInterval = setInterval(
      async () => {
        const game = await this.redis.json.get(gameSession, {
          path: ['state', 'position', 'whiteTime', 'blackTime', 'gameId']
        });

        if (!isGame(game)) {
          throw new SocketError('No game exists for game clock in startGameClock');
        }

        const { state, position, whiteTime, blackTime } = game;
        if (state === 'ABORTED') {
          clearInterval(<number>this.clockInterval);
        }

        if (state === 'COMPLETE') {
          clearInterval(<number>this.clockInterval);
        }

        const chess = new Chess(position);
        const endTime = DateTime.now();
        const delta = endTime.diff(<DateTime>this.startTime, ['milliseconds']).milliseconds;
        if (state === 'IN_PROGRESS') {
          if (chess.turn() === 'w') {
            if (whiteTime - delta <= 0) {
              this.handleGameCompletion('BLACK', 'TIME_WHITE');
              Logger.info('White time up');
            } else {
              const clock: GameClock = {
                whiteTime: whiteTime - delta,
                blackTime,
                timestampUtc: DateTime.utc().toString()
              };
              await Promise.all([
                this.redis.json.numIncrBy(gameSession, 'whiteTime', -delta),
                this.io.in(gameRoom).emit('message:game:clock', clock)
              ]);
            }
          } else {
            if (blackTime - delta <= 0) {
              this.handleGameCompletion('WHITE', 'TIME_BLACK');
              Logger.info('Black time up');
            } else {
              const clock: GameClock = {
                whiteTime,
                blackTime: blackTime - delta,
                timestampUtc: DateTime.utc().toString()
              };
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
    /*
      1. If the game is in state PENDING after time GAME_ABORT_MS, set the game to abort state.
        CASE 1: The game is in state PENDING.
        CASE 2: The game is in state IN_PROGRESS and the watcher has been set for WHITE.
          1. This means that a player has connected and now white as GAME_ABORT_MS time to make a move.
        CASE 3: The game is in state IN_PROGRESS and the watcher has been set for BLACK.
          1. This means that white has made the first move and now black has GAME_ABORT_MS time to make a move.
    */
    setTimeout(
      async () => {
        const game = await this.redis.json.get(gameSession, {
          path: ['state', 'userWhiteId', 'userBlackId', 'gameId', 'history']
        });

        if (!(isGamePending(game) || isGameInProgress(game))) {
          throw new SocketError('Incorrect game state in handler setGameAbortWatcher.');
        }

        let gameAborted = false;
        const { state: gameState, userWhiteId, userBlackId, gameId, history } = game;
        // One player has not sent game confirmation.
        if (gameState === 'PENDING') {
          gameAborted = true;
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
          Logger.info(`Game ${gameSession} abort time expired with no action.`);
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
    this.chess.reset();
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
    2. Validate that the current time minus the client timestamp is greater than 0.
    3. Update the players manager game state with the opponents last move based in state. 
       This is because each client socket has instantiated their own GameManager. 
    4. Validate the players move is legal.
    5. Compute the players move latency and subtract (up to) maxMoveLatency
    6. Check if the game is over (checkmate, stalemate, draw, threefold repetition, or insufficient material)
       If true then call handleGameCompletion.
    7. If it is the first move start the game clock and the abort game watcher for black.
  */
    Logger.debug('%o', gameMove);
    const endTime = DateTime.utc();
    const maxMoveLatency = parseInt(MAX_MOVE_CORRECTION_LATENCY_MS);
    const { timestampUtc, promotion, ...playerMove } = gameMove;
    const { userId, gameRoom, gameSession } = <Record<string, string>>this.socket.data;
    const game = await this.redis.json.get(gameSession, {
      path: ['userWhiteId', 'userBlackId', 'state', 'position', 'history']
    });

    if (!isGameInProgress(game)) {
      throw new SocketError('Incorrect game state in handler updateGameMove.');
    }
    const { userWhiteId, userBlackId, position, history } = game;

    if (
      !(typeof timestampUtc === 'string') ||
      !DateTime.fromISO(timestampUtc).isValid ||
      !(endTime.diff(DateTime.fromISO(timestampUtc), ['milliseconds']).milliseconds >= 0)
    ) {
      throw new SocketError('Bad client timestamp in handler updateGameMove.', {
        endTime,
        timestampUtc
      });
    }

    const _chess = new Chess(position);
    if (
      ![userWhiteId, userBlackId].includes(userId) ||
      (userId === userWhiteId && _chess.turn() === 'b') ||
      (userId === userBlackId && _chess.turn() === 'w')
    ) {
      throw new SocketError('User tried to make a move not on their turn', gameMove);
    }

    if (history.length) {
      const {
        from: prevFrom,
        to: prevTo,
        promotion: prevPromotion
      } = <GameHistory>history.pop();
      this.chess.move(<ShortMove>{
        from: prevFrom,
        to: prevTo,
        ...(prevPromotion ? { promotion: prevPromotion } : {})
      });
    }

    const move = this.chess.move(<ShortMove>{
      ...playerMove,
      ...(promotion ? { promotion } : {})
    });
    Logger.debug('move %o', move);
    if (!move) {
      throw new SocketError('User made an illegal move', gameMove);
    }

    if (this.chess.in_checkmate()) {
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
      const { from, to, color, piece, captured, san, flags } = move;
      const nextPosition = this.chess.fen();
      const sentTime = DateTime.fromISO(timestampUtc);
      const colorTurn = color === 'w' ? 'whiteTime' : 'blackTime';
      const delta = endTime.diff(sentTime, ['milliseconds']).milliseconds;
      await Promise.all([
        delta > maxMoveLatency
          ? this.redis.json.numIncrBy(gameSession, colorTurn, maxMoveLatency)
          : this.redis.json.numIncrBy(gameSession, colorTurn, delta),
        this.redis.json.set(gameSession, 'position', this.chess.fen()),
        this.redis.json.set(gameSession, 'pendingDrawOfferFrom', null),
        this.socket.to(gameRoom).emit('message:game:move', {
          ...playerMove,
          ...(promotion ? { promotion } : {}),
          ...(['O-O', 'O-O-O'].includes(san) ? { castle: san } : {}),
          ...(flags === 'e' ? { enPassant: true } : {})
        }),
        this.redis.json.arrAppend(gameSession, 'history', {
          from,
          to,
          position: nextPosition,
          piece,
          ...(captured ? { captured } : {}),
          ...(promotion ? { promotion } : {}),
          ...(['O-O', 'O-O-O'].includes(san) ? { castle: san } : {})
        })
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
    /*
      1. Calculate the elo rating update for each player.
      2. If the manager state for the game does not match the state, update the last move so that
         the full pgn can be output. This can occur for example if an opponent offers a draw on the
         players move and that player accepts. Then the manager game state would not be up to date with
         the true state.
      3. Update the database.
      4. Update the game state. 
    */
    const { gameRoom, gameSession, gameId } = <Record<string, string>>this.socket.data;
    const game = await this.redis.json.get(gameSession);

    if (!isGameInProgress(game)) {
      throw new SocketError('Incorrect game state in handler handleGameCompletion.');
    }

    const {
      userWhite,
      userBlack,
      ratingBlack,
      ratingWhite,
      userWhiteId,
      userBlackId,
      type,
      history,
      startTime
    } = game;

    const { newWhiteRating, newBlackRating } = calculateUpdatedEloRating(
      ratingWhite,
      ratingBlack,
      result,
      50 // TODO: Get number of player games, hardcoded for now non-provisional for now.
    );

    if (history.length) {
      const lastMove = history[history.length - 1];
      if (lastMove.position !== this.chess.fen()) {
        const { from, to, promotion } = lastMove;
        this.chess.move(<ShortMove>{ from, to, ...(promotion ? { promotion } : {}) });
      }
    }

    this.chess.header('White', userWhite, 'Black', userBlack, 'Date', <string>startTime);
    const pgn = this.chess.pgn();

    await this.db
      .request()
      .input('game_id', sql.UniqueIdentifier, gameId)
      .input('user_white_id', sql.UniqueIdentifier, userWhiteId)
      .input('user_black_id', sql.UniqueIdentifier, userBlackId)
      .input('new_rating_white', sql.SmallInt, newWhiteRating)
      .input('new_rating_black', sql.SmallInt, newBlackRating)
      .input('result', sql.Bit, result === 'WHITE' ? 1 : 0)
      .input('game_type', sql.NVarChar(5), type)
      .input('pgn', sql.NVarChar(1000), pgn)
      .execute('api.create_game');

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
      playerMove && this.socket.to(gameRoom).emit('message:game:move', playerMove),
      this.io.in(gameRoom).emit('message:game:complete', <GameComplete>{
        type: resultType,
        newWhiteRating: newWhiteRatingRounded,
        newBlackRating: newBlackRatingRounded,
        result
      })
    ]);
  };

  private handleDrawOffer = async () => {
    /*
      1. The player offers the opponent a draw. 
      2. Set a pending draw offer in game state using the players usrId.
      3. Send the draw offer to the client.
    */
    const { userId, gameRoom, gameSession } = <Record<string, string>>this.socket.data;
    const game = await this.redis.json.get(gameSession, {
      path: ['pendingDrawOfferFrom', 'userWhiteId', 'userBlackId', 'state']
    });

    if (!isGameInProgress(game)) {
      throw new SocketError('Incorrect game state in handler handleDrawOffer.');
    }

    const { pendingDrawOfferFrom, userWhiteId, userBlackId } = game;
    if (![userWhiteId, userBlackId].includes(userId)) {
      throw new SocketError(`User ${userId} does not have access to game.`);
    }

    if (!pendingDrawOfferFrom) {
      await Promise.all([
        this.socket.to(gameRoom).emit('message:game:draw:offer'),
        this.redis.json.set(gameSession, 'pendingDrawOfferFrom', userId)
      ]);
    }
  };

  private handleAcceptDrawOffer = async () => {
    /* 
      1. Handled after handleDrawOffer if the player accepts.
      2. Call handleGameCompletion.
    */
    const { userId, gameSession } = <Record<string, string>>this.socket.data;
    const game = await this.redis.json.get(gameSession, {
      path: ['pendingDrawOfferFrom', 'userWhiteId', 'userBlackId', 'state']
    });

    if (!isGameInProgress(game)) {
      throw new SocketError('Incorrect game state in handler handleAcceptDrawOffer.');
    }

    const { pendingDrawOfferFrom, userWhiteId, userBlackId } = game;
    if ([userWhiteId, userBlackId].includes(userId) && pendingDrawOfferFrom !== userId) {
      this.handleGameCompletion('DRAW', 'DRAW');
    }
  };

  private handleResignation = async () => {
    const { userId, gameSession } = <Record<string, string>>this.socket.data;
    const game = await this.redis.json.get(gameSession, {
      path: ['userWhiteId', 'userBlackId', 'state']
    });

    if (!isGameInProgress(game)) {
      throw new SocketError('Incorrect game state in handler handleResignation.');
    }

    const { userWhiteId, userBlackId } = game;
    if (![userWhiteId, userBlackId].includes(userId)) {
      throw new SocketError(`User ${userId} does not have access to game.`);
    }

    const result = userId === userWhiteId ? 'BLACK' : 'WHITE';
    this.handleGameCompletion(result, 'RESIGN');
  };

  private broadcastGameChat = async (message: string) => {
    const { userId, username, gameSession, gameRoom } = <Record<string, string>>(
      this.socket.data
    );
    const game = await this.redis.json.get(gameSession, {
      path: ['userWhiteId', 'userBlackId', 'gameId']
    });

    if (!isGame(game)) {
      throw new SocketError('No game exists for game chat in broadcastGameChat.');
    }

    const { userWhiteId, userBlackId } = game;
    if (![userWhiteId, userBlackId].includes(userId)) {
      return;
    }

    if (!(await this.redis.exists(`chat:game:timeout:${userId}`))) {
      await this.redis.set(`chat:game:timeout:${userId}`, gameSession, {
        EX: parseInt(GAME_CHAT_TIMEOUT_SEC)
      });
      // TODO: Include timestamp on GameChat to limit rate of messages on the server side.
      this.io.in(gameRoom).emit('message:game:chat', <GameChat>{
        username,
        message: this.chatFilter.clean(message)
      });
    }
  };

  private reconnectGame = async () => {
    /*
      Syncs a reconnected socket to the current state of the game.
        1. Check if the player has a game.
        2. Get the game history from state and update the manager state.
        3. Send the current game state to the client.
    */
    const { userSession, username } = this.socket.data;
    const gameId = await this.redis.json.get(userSession, { path: ['playingGame'] });
    if (gameId) {
      const gameSession = `game:${gameId}`;
      const gameRoom = `room:game:${gameId}`;
      const [game] = await Promise.all([
        <RedisJSON>this.redis.json.get(gameSession),
        this.socket.join(gameRoom)
      ]);

      if (!isGame(game)) {
        throw new SocketError('No game exists for game reconnect in reconnectGame.');
      }

      const { history, userWhite } = game;
      const { position: currentPosition } = history[history.length - 1];
      const color = username === userWhite ? 'w' : 'b';
      const maxHistory = // On a players turn the state of this.chess is behind one move.
        new Chess(currentPosition).turn() === color ? history.length - 2 : history.length - 1;
      if (history.length > 0) {
        for (let i = 0; i <= maxHistory; i++) {
          const { from, to, promotion } = history[i];
          this.chess.move(<ShortMove>{ from, to, ...(promotion ? { promotion } : {}) });
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userWhiteId, userBlackId, ...rest } = game;
      await this.socket.emit('message:game:load', rest);
    }
  };

  private chess;
  private chatFilter;
  private startTime: DateTime | null;
  private clockInterval: number | null;
  constructor(io: ioServer, socket: Socket, redis: RedisClientType, db: ConnectionPool) {
    super(io, socket, redis, db);
    this.chess = new Chess();
    this.chatFilter = new Filter();
    this.startTime = null;
    this.clockInterval = null;

    this.reconnectGame();

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
