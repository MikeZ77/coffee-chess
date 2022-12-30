import type { Socket } from 'socket.io-client';
import type {
  UserInfo,
  GameChat,
  GameConfirmation,
  GameAborted,
  GameClock,
  GameMove,
  GameDrawOffer,
  GameComplete
} from '@Types';
import type { ClientGame } from '../state';
import type { UserAction, AnyActions } from '../actions/index';
import type { Dispatch } from '@Common/types';
import type { State } from '../state';
import { clearQueueSpinners, clientEvent, gameCompleteToastHelper } from './simple.utils';
import { DateTime } from 'luxon';
import { ClientClock } from './chess';
import { warningToast } from '@Common/toast';
import Chess from 'chess.js';
import {
  updateUserInfo,
  updatePlayerTime,
  updateGameState,
  updateDrawOffer
} from '../actions/index';
import { initNewGame, updateChatLog, setPlayerColor } from '../actions/index';
import {
  INPUT_EVENT_TYPE,
  MARKER_TYPE,
  COLOR
} from 'cm-chessboard/src/cm-chessboard/Chessboard';

const { GAME_CLOCK_SERVER_SYNC_MS } = process.env;

export const registerGameEvents = (
  socket: Socket,
  dispatch: Dispatch<AnyActions, State>,
  // @ts-ignore
  board
) => {
  const newGameMatch = (message: ClientGame) => {
    /*
      If we see a matching game:
        1. Confirm that we saw the message and are ready by emitting to message:game:ready 
        2. Setup the board.
    */
    const state = <State>dispatch();
    const { username } = state;
    const { userWhite, userBlack, position } = message;
    if ([userWhite, userBlack].includes(username)) {
      socket.emit('message:game:ready', <GameConfirmation>{ ready: true });
      const color = username === userWhite ? COLOR.white : COLOR.black;
      dispatch(initNewGame(message));
      dispatch(setPlayerColor(color));
      clearQueueSpinners(dispatch);
      board.setPosition(position, false);
      board.setOrientation(color);
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
      const result = chess.move({ from: event.squareFrom, to: event.squareTo });
      //TODO: If its not the users turn then do not return.
      if (result) {
        const gameMove: GameMove = {
          from: result.from,
          to: result.to,
          timestampUtc: DateTime.utc().toString()
        };
        socket.emit('message:game:move', gameMove);
        const {
          currentGame: { pendingDrawOfferFrom },
          audio: { pieceMoveSound }
        } = <State>dispatch();
        chess.turn() === 'w'
          ? clock.startWhiteClock(dispatch)
          : clock.startBlackClock(dispatch);
        pieceMoveSound?.play();
        if (pendingDrawOfferFrom) {
          dispatch(updateDrawOffer(null));
        }
        return result;
      }
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
    dispatch(updateChatLog(message));
    dispatch(updateGameState('IN_PROGRESS'));
    board.enableMoveInput(attachBoardInputHandler, color);
    state.audio.newGameSound?.play();
  };

  const opponentMove = (move: GameMove) => {
    const { from, to } = move;
    board.movePiece(from, to, true);
    chess.move({ from, to });
    chess.turn() === 'w' ? clock.startWhiteClock(dispatch) : clock.startBlackClock(dispatch);
    dispatch(updateDrawOffer(null));
  };

  const gameAborted = (message: GameAborted) => {
    if (message.aborted) {
      dispatch(updateChatLog(<GameChat>{ username: undefined, message: 'ABORTED' }));
      warningToast('Game aborted. Opponent failed to connect.');
      board.disableMoveInput();
      chess.reset();
      // Play end game sound.
    }
  };

  const syncWithServerClock = (clock: GameClock) => {
    const { whiteTime, blackTime, timestampUtc } = clock;
    const startTime = DateTime.fromISO(timestampUtc!);
    const currentTime = DateTime.utc();
    const latency = currentTime.diff(startTime, ['milliseconds']).milliseconds;
    const state = <State>dispatch();
    const whiteServerTime = whiteTime + latency;
    const blackServerTime = blackTime + latency;
    const whiteClientTime = <number>state.currentGame.whiteTime;
    const blackClientTime = <number>state.currentGame.blackTime;
    const syncDelta = parseInt(GAME_CLOCK_SERVER_SYNC_MS);

    // console.log('White', Math.abs(whiteServerTime - whiteClientTime));
    // console.log('Black', Math.abs(blackServerTime - blackClientTime));

    if (Math.abs(whiteServerTime - whiteClientTime) > syncDelta) {
      dispatch(
        updatePlayerTime(<GameClock>{
          whiteTime: whiteServerTime,
          blackTime: blackClientTime
        })
      );
    }

    if (Math.abs(blackServerTime - blackClientTime) > syncDelta) {
      dispatch(
        updatePlayerTime(<GameClock>{
          whiteTime: whiteClientTime,
          blackTime: blackServerTime
        })
      );
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
    // Emit resignation to server
    console.log('resign');
  };

  const gameComplete = (message: GameComplete) => {
    const { type, newBlackRating, newWhiteRating, result } = message;
    board.disableMoveInput();
    clock.stopClocks();
    const {
      currentGame: { userWhite, userBlack, ratingWhite, ratingBlack }
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
    }
    // Dispatch game result
    // Play end game sound
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
  clientEvent.on('event:game:draw:offer', offerDraw);
  clientEvent.on('event:game:draw:accept', acceptDraw);
  clientEvent.on('event:game:resign', resign);
};

export const registerUserEvents = (socket: Socket, dispatch: Dispatch<UserAction>) => {
  const userInfo = (message: UserInfo) => {
    dispatch(updateUserInfo(message));
  };

  const userNotification = (message: string) => {
    console.log('Notification', message);
  };

  const userPing = (pong: Function) => pong();

  socket.on('message:user:info', userInfo);
  socket.on('message:user:ping', userPing);
  socket.on('message:user:notification', userNotification);
};
