// @ts-nocheck
import { INPUT_EVENT_TYPE, MARKER_TYPE } from 'cm-chessboard/src/cm-chessboard/Chessboard';
import { Extension, EXTENSION_POINT } from 'cm-chessboard/src/cm-chessboard/model/Extension';
import Chess from 'chess.js';

const chess = new Chess();

// class SendMoveExtension extends Extension {
//   constructor(chessboard, props) {
//     super(chessboard, props);
//     this.registerExtensionPoint(EXTENSION_POINT.positionChanged, (data) => {
//       console.log('positionChanged', data);
//     });
//   }
// }

export const boardConfig = {
  position: chess.fen(),
  responsive: true,
  sprite: {
    url: '2807878831d82b261a27.svg'
  },
  // extensions: [
  //   {
  //     class: SendMoveExtension
  //     // props: {
  //     //   pie: 'pie'
  //     // }
  //   }
  // ],
  style: {
    aspectRatio: 1,
    moveFromMarker: undefined,
    moveToMarker: undefined
  }
};
