// @ts-nocheck
import Chess from 'chess.js';

const chess = new Chess();

export const boardConfig = {
  position: chess.fen(),
  responsive: true,
  sprite: {
    url: '2807878831d82b261a27.svg'
  },
  style: {
    aspectRatio: 1,
    moveFromMarker: undefined,
    moveToMarker: undefined
  }
};
