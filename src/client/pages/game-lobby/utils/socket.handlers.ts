import type { Socket } from 'socket.io-client';
import type {
  UserInfo,
  GameChat,
  GameConfirmation,
  GameAborted,
  GameClock,
  GameMove,
  GameDrawOffer,
  GameComplete,
  GameResign,
  ServerMessage
} from '@Types';
import type { ClientGame } from '../state';
import type { UserAction, AnyActions } from '../actions/index';
import type { Dispatch } from '@Common/types';
import type { State } from '../state';
import {
  clearQueueSpinners,
  clientEvent,
  gameCompleteToastHelper,
  initChatTimeout,
  highlightCurrentMoveHistory
} from './simple.utils';
import { DateTime } from 'luxon';
import { ClientClock } from './chess';
import { warningToast } from '@Common/toast';
import Chess from 'chess.js';
import {
  updateUserInfo,
  updatePlayerTime,
  updateGameState,
  updateDrawOffer,
  updateGameResult,
  clearChatMessage,
  setBoardPosition,
  initGame,
  updateChatLog,
  setPlayerColor,
  updateConsoleMoveHistory,
  disablePage,
  setLowTimeSoundPlayed
} from '../actions/index';
import {
  INPUT_EVENT_TYPE,
  MARKER_TYPE,
  COLOR
} from 'cm-chessboard/src/cm-chessboard/Chessboard';

export const registerGameEvents = (
  socket: Socket,
  dispatch: Dispatch<AnyActions, State>,
  // @ts-ignore
  board
) => {
  const newGameMatch = (game: ClientGame) => {
    /*
      If we see a matching game:
        1. Confirm that we saw the message and are ready by emitting to message:game:ready 
        2. Setup the board.
    */
    const state = <State>dispatch();
    const { username } = state;
    const { userWhite, userBlack, position } = game;
    if ([userWhite, userBlack].includes(username)) {
      socket.emit('message:game:ready', <GameConfirmation>{ ready: true });
      const color = username === userWhite ? COLOR.white : COLOR.black;
      dispatch(initGame(game));
      dispatch(setPlayerColor(color));
      clearQueueSpinners(dispatch);
      board.setPosition(position, false);
      board.setOrientation(color);
    }
  };

  const loadCurrentGame = (game: ClientGame) => {
    const { username } = <State>dispatch();
    const { userWhite, position } = game;
    const color = username === userWhite ? COLOR.white : COLOR.black;
    dispatch(initGame(game));
    dispatch(setPlayerColor(color));
    chess.load(position);
    board.setPosition(position, false);
    board.setOrientation(color);
    chess.turn() === 'w' ? clock.startWhiteClock(dispatch) : clock.startBlackClock(dispatch);
    if (chess.turn() === color) {
      board.enableMoveInput(attachBoardInputHandler, color);
    }
  };

  // @ts-ignore
  const attachBoardInputHandler = (event) => {
    event.chessboard.removeMarkers(MARKER_TYPE.dot);
    if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
      const moves = chess.moves({ square: event.square, verbose: true });
      for (const move of moves) {
        event.chessboard.addMarker(MARKER_TYPE.dot, move.to);
      }
      return moves.length > 0;
    }

    if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
      console.log('event.squareTo', event.squareTo);
      const eighthRank = event.squareTo.charAt(1) === '8' ? true : false;
      const firstRank = event.squareTo.charAt(1) === '1' ? true : false;
      if ((eighthRank || firstRank) && event.piece.charAt(1) === 'p') {
        return handleEventCheckPromotion(
          event.squareFrom,
          event.squareTo,
          eighthRank ? COLOR.white : COLOR.black,
          event.chessboard
        );
      }
      return handleEventPieceMove(event.squareFrom, event.squareTo);
    }
  };

  const handleEventCheckPromotion = (
    squareFrom: string,
    squareTo: string,
    color: 'w' | 'b',
    // @ts-ignore
    chessboard
  ) => {
    // @ts-ignore
    chessboard.showPromotionDialog(squareTo, color, (promotionEvent) => {
      console.log('promotionEvent', promotionEvent);
      console.log('Piece selected', promotionEvent.piece);
      if (promotionEvent.piece) {
        console.log('promotionEvent.square', promotionEvent.square);
        console.log('promotionEvent.piece', promotionEvent.piece);
        chessboard.setPiece(squareFrom, null);
        chessboard.setPiece(promotionEvent.square, promotionEvent.piece, true);
        const promotionPiece = promotionEvent.piece.charAt(1);
        handleEventPieceMove(squareFrom, squareTo, promotionPiece);
      } else {
        chessboard.setPosition(chess.fen());
      }
    });
  };

  const handleEventPieceMove = (
    squareFrom: string,
    squareTo: string,
    promotionPiece?: string
  ) => {
    const result = chess.move({
      from: squareFrom,
      to: squareTo,
      ...(promotionPiece ? { promotion: promotionPiece } : {})
    });
    console.log('result1', result);
    if (result) {
      console.log('result2', result);
      const { from, to, piece, promotion, captured } = result;
      socket.emit('message:game:move', <GameMove>{
        from,
        to,
        ...(promotion ? { promotion } : {}),
        timestampUtc: DateTime.utc().toString()
      });
      const {
        currentGame: {
          pendingDrawOfferFrom,
          history: [...history]
        },
        audio: { pieceMoveSound }
      } = <State>dispatch();
      chess.turn() === 'w' ? clock.startWhiteClock(dispatch) : clock.startBlackClock(dispatch);
      dispatch(setBoardPosition(chess.fen()));
      dispatch(
        updateConsoleMoveHistory({
          from,
          to,
          position: chess.fen(),
          piece,
          ...(promotion ? { promotion } : {}),
          ...(captured ? { captured } : {})
        })
      );
      pieceMoveSound?.play();
      history.length === 0
        ? highlightCurrentMoveHistory(chess.fen())
        : highlightCurrentMoveHistory(chess.fen(), history[history.length - 1].position);
      if (pendingDrawOfferFrom) {
        dispatch(updateDrawOffer(null));
      }
      return result;
    }
  };

  const gameConnected = (message: GameChat) => {
    /*
      Game is IN_PROGRESS and we can make moves.
        1. Add the player connected server message to the game chat log.
        2. Enable the board.
    */
    const state = <State>dispatch();
    const { color } = state.currentGame;
    dispatch(updateGameState('IN_PROGRESS'));
    board.enableMoveInput(attachBoardInputHandler, color);
    console.log('Game connected message: ', message);
    dispatch(updateChatLog(message));
    // chess.reset();
    state.audio.newGameSound?.play();
  };

  const opponentMove = (move: GameMove) => {
    console.log('move', move);
    const { from, to, promotion } = move;
    const prevPosition = chess.fen();
    const { piece, captured, color } = chess.move({
      from,
      to,
      ...(promotion ? { promotion } : {})
    });
    board.setPosition(prevPosition);
    board.movePiece(from, to, true).then(() => {
      if (promotion) {
        board.setPiece(to, `${color}${promotion}`);
      }
    });
    chess.turn() === 'w' ? clock.startWhiteClock(dispatch) : clock.startBlackClock(dispatch);
    dispatch(setBoardPosition(chess.fen()));
    dispatch(
      updateConsoleMoveHistory({
        from,
        to,
        position: chess.fen(),
        piece,
        ...(promotion ? { promotion } : {}),
        ...(captured ? { captured } : {})
      })
    );
    highlightCurrentMoveHistory(chess.fen(), prevPosition);
    dispatch(updateDrawOffer(null));
  };

  const gameAborted = (message: GameAborted) => {
    if (message.aborted) {
      board.disableMoveInput();
      clock.stopClocks();
      dispatch(updateGameState('ABORTED'));
      dispatch(updateChatLog(<GameChat>{ username: undefined, message: 'ABORTED' }));
      warningToast('Game aborted.');
    }
  };

  const syncWithServerClock = (clock: GameClock) => {
    const { whiteTime, blackTime, timestampUtc } = clock;
    const startTime = DateTime.fromISO(timestampUtc!);
    const currentTime = DateTime.utc();
    const latency = currentTime.diff(startTime, ['milliseconds']).milliseconds;
    const { currentGame, audio } = <State>dispatch();
    const whiteServerTime = whiteTime + latency;
    const blackServerTime = blackTime + latency;
    const whiteClientTime = <number>currentGame.whiteTime;
    const blackClientTime = <number>currentGame.blackTime;
    // Strange behavior here. Assigning outside the function or destructuring
    // both at the same time leads to undefined.
    const { GAME_CLOCK_SERVER_SYNC_MS } = process.env;
    const { GAME_LOW_TIME_MS } = process.env;
    const syncDelta = parseInt(GAME_CLOCK_SERVER_SYNC_MS);
    const lowTimeMark = parseInt(GAME_LOW_TIME_MS);

    // console.log('White', Math.abs(whiteServerTime - whiteClientTime));
    // console.log('Black', Math.abs(blackServerTime - blackClientTime));

    if (Math.abs(whiteServerTime - whiteClientTime) > syncDelta!) {
      dispatch(
        updatePlayerTime(<GameClock>{
          whiteTime: whiteServerTime,
          blackTime: blackClientTime
        })
      );
    }

    if (Math.abs(blackServerTime - blackClientTime) > syncDelta!) {
      dispatch(
        updatePlayerTime(<GameClock>{
          whiteTime: whiteClientTime,
          blackTime: blackServerTime
        })
      );
    }

    if (
      whiteServerTime <= lowTimeMark &&
      currentGame.color === 'w' &&
      !audio.lowTimeSoundPlayed
    ) {
      audio.lowTimeSound?.play();
      dispatch(setLowTimeSoundPlayed(true));
    }

    if (
      blackServerTime <= lowTimeMark &&
      currentGame.color === 'b' &&
      !audio.lowTimeSoundPlayed
    ) {
      audio.lowTimeSound?.play();
      dispatch(setLowTimeSoundPlayed(true));
    }
  };

  const offerDraw = () => {
    socket.emit('message:game:draw:offer', <GameDrawOffer>{ drawOffer: true });
    const {
      username,
      currentGame: { userWhite, userBlack }
    } = <State>dispatch();
    const user = username === userWhite ? userWhite : userBlack;
    dispatch(updateDrawOffer(user));
    dispatch(
      updateChatLog(<GameChat>{
        username: undefined,
        message: `${user} has offered a draw.`
      })
    );
  };

  const acceptDraw = () => {
    socket.emit('message:game:draw:accept', <GameDrawOffer>{ drawOffer: true });
    dispatch(updateDrawOffer(null));
  };

  const opponentDrawOffer = (offer: GameDrawOffer) => {
    if (offer.drawOffer) {
      const {
        username,
        currentGame: { userWhite, userBlack },
        audio: { notificationSound }
      } = <State>dispatch();
      const opponent = username === userWhite ? userBlack : userWhite;
      dispatch(updateDrawOffer(opponent));
      dispatch(
        updateChatLog(<GameChat>{
          username: undefined,
          message: `${opponent} has offered a draw.`
        })
      );
      notificationSound?.play();
    }
  };

  const resign = () => {
    socket.emit('message:game:resign', <GameResign>{ resign: true });
  };

  const gameComplete = (message: GameComplete) => {
    const { type, newBlackRating, newWhiteRating, result } = message;
    board.disableMoveInput();
    clock.stopClocks();
    const {
      currentGame: { userWhite, userBlack, ratingWhite, ratingBlack, whiteTime, blackTime },
      audio: { gameCompleteSound }
    } = <State>dispatch();
    const gameData = {
      userWhite,
      userBlack,
      newWhiteRating,
      newBlackRating,
      ratingWhite: <number>ratingWhite,
      ratingBlack: <number>ratingBlack
    };

    switch (type) {
      case 'RESIGN': {
        gameCompleteToastHelper({
          ...gameData,
          gameMessage: `${result === 'WHITE' ? 'White' : 'Black'} wins by resignation`
        });
        break;
      }
      case 'CHECKMATE': {
        gameCompleteToastHelper({
          ...gameData,
          gameMessage: 'Checkmate.'
        });
        break;
      }
      case 'DRAW': {
        gameCompleteToastHelper({
          ...gameData,
          gameMessage: 'Game drawn.'
        });
        break;
      }
      case 'TIME_WHITE': {
        gameCompleteToastHelper({
          ...gameData,
          gameMessage: 'Black wins on time.'
        });

        break;
      }
      case 'TIME_BLACK': {
        gameCompleteToastHelper({
          ...gameData,
          gameMessage: 'White wins on time.'
        });
        break;
      }
    }
    dispatch(updateGameResult(result));
    dispatch(updateGameState('COMPLETE'));
    gameCompleteSound?.play();
  };

  const sendChatMessage = () => {
    const {
      gameConsole: { gameChatMessage, timeout }
    } = <State>dispatch();
    const { GAME_CHAT_CLIENT_TIMEOUT_MS } = process.env;
    const chatTimeoutMs = parseInt(GAME_CHAT_CLIENT_TIMEOUT_MS);
    if (!timeout) {
      socket.emit('message:game:chat', gameChatMessage);
      dispatch(clearChatMessage());
      initChatTimeout(dispatch, chatTimeoutMs);
    } else {
      warningToast(
        `Wait ${Math.round(chatTimeoutMs / 1000)} seconds before sending a message.`
      );
    }
  };

  const updateGameChat = (chatMessage: GameChat) => {
    const { username, message } = chatMessage;
    dispatch(
      updateChatLog({
        username,
        message
      })
    );
  };

  const setPosition = (position: string) => {
    const {
      currentGame: { history, position: prevPosition }
    } = <State>dispatch();

    if (history.length === 0) {
      return;
    }
    const currentPosition = history[history.length - 1].position;
    const startPosition = history[0].position;
    if (position === currentPosition) {
      setCurrentPosition();
    } else if (position === startPosition) {
      setStartPosition();
    } else {
      board.disableMoveInput();
      dispatch(setBoardPosition(position));
      board.setPosition(position);
      highlightCurrentMoveHistory(position, prevPosition);
    }
  };

  const nextMove = () => {
    const {
      currentGame: { position, history, color, state }
    } = <State>dispatch();
    const currentPosition = history[history.length - 1].position;
    if (position !== currentPosition) {
      board.disableMoveInput();
      const index = history.findIndex((move) => {
        return move.position === position;
      });
      const nextMove = history[index + 1];
      const { from, to, position: nextPosition, promotion } = nextMove;
      dispatch(setBoardPosition(nextMove.position));
      board.movePiece(from, to, true).then(() => {
        if (promotion) {
          board.setPiece(to, `${(index + 1) % 2 === 0 ? 'w' : 'b'}${promotion}`);
        }
      });
      highlightCurrentMoveHistory(nextPosition, position);
      if (
        nextMove.position === currentPosition &&
        chess.turn() === color &&
        state === 'IN_PROGRESS'
      ) {
        board.enableMoveInput(attachBoardInputHandler, color);
      }
    }
  };

  const prevMove = () => {
    const {
      currentGame: { position, history }
    } = <State>dispatch();
    if (history.length > 0) {
      board.disableMoveInput();
      const index = history.findIndex((move) => {
        return move.position === position;
      });
      const { from, to, promotion } = history[index];
      if (index > 0) {
        const { position: prevPosition } = history[index - 1];
        board.movePiece(to, from, true).then(() => {
          if (promotion) {
            board.setPiece(from, `${index % 2 === 0 ? 'w' : 'b'}p`);
          }
        });
        dispatch(setBoardPosition(prevPosition));
        highlightCurrentMoveHistory(prevPosition, position);
      }
    }
  };

  const setStartPosition = () => {
    const {
      currentGame: { history, position: prevPosition }
    } = <State>dispatch();
    if (history.length !== 0) {
      board.disableMoveInput();
      const { position } = history[0];
      dispatch(setBoardPosition(position));
      board.setPosition(position);
      highlightCurrentMoveHistory(position, prevPosition);
    }
  };

  const setCurrentPosition = () => {
    const {
      currentGame: { position, history, color, state }
    } = <State>dispatch();
    const currentPosition = history[history.length - 1].position;
    if (position !== currentPosition) {
      board.setPosition(currentPosition);
      dispatch(setBoardPosition(currentPosition));
      highlightCurrentMoveHistory(currentPosition, position);
      if (chess.turn() === color && state === 'IN_PROGRESS') {
        board.enableMoveInput(attachBoardInputHandler, color);
      }
    }
  };

  // @ts-ignore
  const chess = new Chess();
  const clock = new ClientClock();
  socket.on('message:game:match', newGameMatch);
  socket.on('message:game:connected', gameConnected);
  socket.on('message:game:move', opponentMove);
  socket.on('message:game:aborted', gameAborted);
  socket.on('message:game:clock', syncWithServerClock);
  socket.on('message:game:draw:offer', opponentDrawOffer);
  socket.on('message:game:complete', gameComplete);
  socket.on('message:game:chat', updateGameChat);
  socket.on('message:game:load', loadCurrentGame);
  clientEvent.on('event:game:draw:offer', offerDraw);
  clientEvent.on('event:game:draw:accept', acceptDraw);
  clientEvent.on('event:game:resign', resign);
  clientEvent.on('event:game:send:chat', sendChatMessage);
  clientEvent.on('event:game:history:position', setPosition);
  clientEvent.on('event:game:history:next', nextMove);
  clientEvent.on('event:game:history:prev', prevMove);
  clientEvent.on('event:game:history:start', setStartPosition);
  clientEvent.on('event:game:history:current', setCurrentPosition);
};

export const registerUserEvents = (socket: Socket, dispatch: Dispatch<UserAction>) => {
  const userInfo = (message: UserInfo) => {
    dispatch(updateUserInfo(message));
  };

  const userNotification = (serverMessage: ServerMessage) => {
    const { type } = serverMessage;
    switch (type) {
      case 'MULTIPLE_WINDOWS': {
        dispatch(disablePage());
      }
    }
  };

  const userPing = (pong: Function) => pong();

  socket.on('message:user:info', userInfo);
  socket.on('message:user:ping', userPing);
  socket.on('message:user:notification', userNotification);
};
