// TODO: Jest cannot find '@types' (see jest.config.json)
import type { Result } from '../../types';
type NewRatings = { newWhiteRating: number; newBlackRating: number };

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
  result: Result,
  numberOfGames: number
): NewRatings => {
  const D = 400,
    K = numberOfGames > 20 ? 20 : 400 / numberOfGames; // Player is provisional for up to 20 games
  const expectedScoreWhite = 1 / (1 + Math.pow(10, (blackRating - whiteRating) / D)); // How likely white is to win.
  const expectedScoreBlack = 1 / (1 + Math.pow(10, (whiteRating - blackRating) / D));
  const newWhiteRating = Number(
    (whiteRating + K * (getActualScore(result, 'WHITE')! - expectedScoreWhite)).toFixed(4)
  );
  const newBlackRating = Number(
    (blackRating + K * (getActualScore(result, 'BLACK')! - expectedScoreBlack)).toFixed(4)
  );
  return { newWhiteRating, newBlackRating };
};

export default calculateUpdatedEloRating;
