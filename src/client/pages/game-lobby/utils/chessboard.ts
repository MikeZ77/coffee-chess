// @ts-nocheck
import { INPUT_EVENT_TYPE } from 'cm-chessboard/src/cm-chessboard/Chessboard';

export const boardConfig = {
  position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
  sprite: {
    url: '2807878831d82b261a27.svg'
  },
  style: {
    aspectRatio: 1
  }
};

export const attachBoardInputHandler = (board): void => {
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
