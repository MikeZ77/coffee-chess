export const genWhiteMoveCheckmate = function* () {
  yield { from: 'f2', to: 'f3' };
  yield { from: 'g2', to: 'g4' };
};

export const genBlackMoveCheckmate = function* () {
  yield { from: 'e7', to: 'e5' };
  yield { from: 'd8', to: 'h4' };
};

export const genWhite50MoveRule = function* () {
  yield { from: 'e2', to: 'e4' };
  yield { from: 'd2', to: 'd3' };
  yield { from: 'g2', to: 'g3' };
  yield { from: 'f1', to: 'g2' };
  yield { from: 'c1', to: 'e3' };
  yield { from: 'g1', to: 'e2' };
  yield { from: 'g1', to: 'e2' };
};

export const genBlack50MoveRule = function* () {
  yield { from: 'e7', to: 'e6' };
  yield { from: 'g8', to: 'e7' };
  yield { from: 'c7', to: 'c5' };
  yield { from: 'b8', to: 'c6' };
  yield { from: 'b7', to: 'b6' };
  yield { from: 'd7', to: 'd5' };
};
