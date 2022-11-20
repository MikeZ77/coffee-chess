// @ts-nocheck
import {
  Chessboard,
  INPUT_EVENT_TYPE
} from 'cm-chessboard/src/cm-chessboard/Chessboard.js';

const config = {
  position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
  sprite: {
    url: '2807878831d82b261a27.svg'
  },
  style: {
    aspectRatio: 1
  }
};

export const initChessboard = () => {
  board = new Chessboard(document.getElementById('board'), config);

  board.enableMoveInput(inputHandler);
  function inputHandler(event) {
    switch (event.type) {
      case INPUT_EVENT_TYPE.moveInputStarted:
        console.log(`moveInputStarted: ${event.square}`);
        return true;
      case INPUT_EVENT_TYPE.validateMoveInput:
        console.log(`validateMoveInput: ${event.squareFrom}-${event.squareTo}`);
        return true;
      case INPUT_EVENT_TYPE.moveInputCanceled:
        console.log(`moveInputCanceled`);
    }
  }
};
