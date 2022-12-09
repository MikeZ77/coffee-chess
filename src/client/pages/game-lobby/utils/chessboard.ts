// @ts-nocheck
import { INPUT_EVENT_TYPE, MARKER_TYPE } from 'cm-chessboard/src/cm-chessboard/Chessboard';
import { Chess } from 'chess.js';

const chess = new Chess();

export const boardConfig = {
  position: chess.fen(),
  sprite: {
    url: '2807878831d82b261a27.svg'
  },
  style: {
    aspectRatio: 1,
    moveFromMarker: undefined,
    moveToMarker: undefined
  }
};

export const attachInputHandler = (event) => {
  event.chessboard.removeMarkers(MARKER_TYPE.dot);
  if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
    const moves = chess.moves({ square: event.square, verbose: true });
    for (const move of moves) {
      event.chessboard.addMarker(MARKER_TYPE.dot, move.to);
    }
    return moves.length > 0;
  }
  if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
    const move = { from: event.squareFrom, to: event.squareTo };
    console.log('move', move);
    // Emit to server
    return chess.move(move);
  }
};
