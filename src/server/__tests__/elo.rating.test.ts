import calculateUpdatedEloRating from '../utils/elo.calculator';

describe('Updating elo ratings with K=50..20 for 30 games provisional', () => {
  /*
    Note this testing is also useful for estimating the variance in rating change
    for different k-factors.
  */

  test('A player with with white should have their non-provisional rating updated when they win', () => {
    const { newWhiteRating } = calculateUpdatedEloRating(1716, 1689, 'WHITE', 25);
    expect(newWhiteRating).toBeCloseTo(1725, 0);
  });

  test('A player with with white should have their non-provisional rating updated when they lose', () => {
    const { newWhiteRating } = calculateUpdatedEloRating(1716, 1689, 'BLACK', 50);
    expect(newWhiteRating).toBeCloseTo(1705, 0);
  });

  test('A player with with black should have their non-provisional rating updated when they win', () => {
    const { newBlackRating } = calculateUpdatedEloRating(2001, 2216, 'BLACK', 50);
    expect(newBlackRating).toBeCloseTo(2220, 0);
  });

  test('A player with with black should have their non-provisional rating updated when they lose', () => {
    const { newBlackRating } = calculateUpdatedEloRating(2001, 2216, 'WHITE', 50);
    expect(newBlackRating).toBeCloseTo(2200, 0);
  });

  test('A player with with white should have their non-provisional rating updated when they draw', () => {
    const { newWhiteRating } = calculateUpdatedEloRating(1402, 1256, 'DRAW', 50);
    expect(newWhiteRating).toBeCloseTo(1398, 0);
  });

  test('A player with with black should have their non-provisional rating updated when they draw', () => {
    const { newBlackRating } = calculateUpdatedEloRating(2001, 2216, 'DRAW', 50);
    expect(newBlackRating).toBeCloseTo(2210, 0);
  });

  // prettier-ignore
  test('A provisional rating change should be greater than a non-provisional rating change after a win', () => {
    const { newBlackRating: newBlackRatingProvisional } = calculateUpdatedEloRating(819, 1167, 'BLACK', 10);
    const { newBlackRating: newBlackRatingNonProvisional } = calculateUpdatedEloRating(819, 1167, 'BLACK', 50);
    expect(newBlackRatingProvisional).toBeGreaterThan(newBlackRatingNonProvisional);
  });

  // prettier-ignore
  test('A provisional rating change should be less than a non-provisional rating change after a loss', () => {
      const { newBlackRating: newBlackRatingProvisional } = calculateUpdatedEloRating(819, 1167, 'WHITE', 10);
      const { newBlackRating: newBlackRatingNonProvisional } = calculateUpdatedEloRating(819, 1167, 'WHITE', 50);
      expect(newBlackRatingProvisional).toBeLessThan(newBlackRatingNonProvisional);
    });
});
