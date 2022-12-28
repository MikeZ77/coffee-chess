import type { Result } from '@Types';
type NewRatings = { newWhiteRating: number; newBlackRating: number };

// TODO: Include number of games. Players with less games (say < 20) have a greater K factor (provisional rating).

const getActualScore = (result: Result, player: 'WHITE' | 'BLACK') => {
  switch (true) {
    case result === 'WHITE' && player === 'WHITE':
      return 1;
    case result === 'WHITE' && player === 'BLACK':
      return 0;
    case result === 'BLACK' && player === 'BLACK':
      return 1;
    case result === 'BLACK' && player === 'WHITE':
      return 0;
    case result === 'DRAW':
      return 0.5;
  }
};

const calculateUpdatedEloRating = (
  whiteRating: number,
  blackRating: number,
  result: Result
): NewRatings => {
  const D = 400,
    K = 32;
  const expectedScoreWhite = 1 / (1 + Math.pow(10, (blackRating - whiteRating) / D)); // How likely white is to win.
  const expectedScoreBlack = 1 / (1 + Math.pow(10, (whiteRating - blackRating) / D));
  const newWhiteRating =
    whiteRating + K * (getActualScore(result, 'WHITE')! - expectedScoreWhite);
  const newBlackRating =
    blackRating + K * (getActualScore(result, 'BLACK')! - expectedScoreBlack);
  return { newWhiteRating, newBlackRating };
};

export default calculateUpdatedEloRating;
