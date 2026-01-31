// Hopper - Score System Tests

import { calculateLevelScore } from '../game/Score';
import { POINTS_ALL_HOMES, POINTS_TIME_BONUS } from '../game/constants';

describe('calculateLevelScore', () => {
  it('calculates level bonus correctly', () => {
    const result = calculateLevelScore(30);
    expect(result.levelBonus).toBe(POINTS_ALL_HOMES); // 1000
  });

  it('calculates time bonus correctly', () => {
    const result = calculateLevelScore(30);
    expect(result.timeBonus).toBe(30 * POINTS_TIME_BONUS); // 30 * 10 = 300
  });

  it('calculates total correctly', () => {
    const result = calculateLevelScore(30);
    expect(result.total).toBe(POINTS_ALL_HOMES + 30 * POINTS_TIME_BONUS); // 1000 + 300 = 1300
  });

  it('floors fractional seconds', () => {
    const result = calculateLevelScore(25.7);
    expect(result.timeBonus).toBe(25 * POINTS_TIME_BONUS); // Floors to 25
  });

  it('handles zero time remaining', () => {
    const result = calculateLevelScore(0);
    expect(result.timeBonus).toBe(0);
    expect(result.total).toBe(POINTS_ALL_HOMES);
  });
});
