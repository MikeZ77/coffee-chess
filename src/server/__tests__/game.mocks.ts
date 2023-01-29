export const genWhiteMoveCheckmate = function* () {
  yield { from: 'f2', to: 'f3' };
  yield { from: 'g2', to: 'g4' };
};

export const genBlackMoveCheckmate = function* () {
  yield { from: 'e7', to: 'e5' };
  yield { from: 'd8', to: 'h4' };
};
