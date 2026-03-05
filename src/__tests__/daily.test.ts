/**
 * Tests for Daily Challenge system
 */

import {
  SeededRNG,
  todayString,
  seedForDate,
  todaySeed,
  DailyLeaderboard,
  generateShareCode,
  parseShareCode,
} from '../game/Daily';

describe('SeededRNG', () => {
  it('produces deterministic results from same seed', () => {
    const rng1 = new SeededRNG(12345);
    const rng2 = new SeededRNG(12345);

    const values1 = Array.from({ length: 10 }, () => rng1.next());
    const values2 = Array.from({ length: 10 }, () => rng2.next());

    expect(values1).toEqual(values2);
  });

  it('produces different results from different seeds', () => {
    const rng1 = new SeededRNG(12345);
    const rng2 = new SeededRNG(54321);

    const value1 = rng1.next();
    const value2 = rng2.next();

    expect(value1).not.toEqual(value2);
  });

  it('nextInt returns values in range', () => {
    const rng = new SeededRNG(99999);

    for (let i = 0; i < 100; i++) {
      const value = rng.nextInt(5, 15);
      expect(value).toBeGreaterThanOrEqual(5);
      expect(value).toBeLessThan(15);
    }
  });

  it('nextFloat returns values in range', () => {
    const rng = new SeededRNG(11111);

    for (let i = 0; i < 100; i++) {
      const value = rng.nextFloat(1.5, 3.5);
      expect(value).toBeGreaterThanOrEqual(1.5);
      expect(value).toBeLessThan(3.5);
    }
  });

  it('pick selects from array deterministically', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    const rng1 = new SeededRNG(42);
    const rng2 = new SeededRNG(42);

    const picks1 = Array.from({ length: 5 }, () => rng1.pick(items));
    const picks2 = Array.from({ length: 5 }, () => rng2.pick(items));

    expect(picks1).toEqual(picks2);
  });

  it('shuffle is deterministic', () => {
    const rng1 = new SeededRNG(777);
    const rng2 = new SeededRNG(777);

    const arr1 = [1, 2, 3, 4, 5];
    const arr2 = [1, 2, 3, 4, 5];

    rng1.shuffle(arr1);
    rng2.shuffle(arr2);

    expect(arr1).toEqual(arr2);
  });
});

describe('seedForDate', () => {
  it('produces same seed for same date', () => {
    const seed1 = seedForDate('2026-03-15');
    const seed2 = seedForDate('2026-03-15');
    expect(seed1).toEqual(seed2);
  });

  it('produces different seeds for different dates', () => {
    const seed1 = seedForDate('2026-03-15');
    const seed2 = seedForDate('2026-03-16');
    expect(seed1).not.toEqual(seed2);
  });

  it('produces positive integer', () => {
    const seed = seedForDate('2026-01-01');
    expect(seed).toBeGreaterThan(0);
    expect(Number.isInteger(seed)).toBe(true);
  });
});

describe('todayString', () => {
  it('returns valid date format', () => {
    const today = todayString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('todaySeed', () => {
  it('returns consistent seed for today', () => {
    const seed1 = todaySeed();
    const seed2 = todaySeed();
    expect(seed1).toEqual(seed2);
  });
});

describe('generateShareCode', () => {
  it('creates valid share code', () => {
    const code = generateShareCode('2026-03-15', 12500);
    expect(code).toBe('HOPPER-20260315-12500');
  });
});

describe('parseShareCode', () => {
  it('parses valid share code', () => {
    const result = parseShareCode('HOPPER-20260315-12500');
    expect(result).toEqual({ date: '2026-03-15', score: 12500 });
  });

  it('returns null for invalid code', () => {
    expect(parseShareCode('INVALID')).toBeNull();
    expect(parseShareCode('HOPPER-123-456')).toBeNull();
    expect(parseShareCode('FROGGER-20260315-1000')).toBeNull();
    expect(parseShareCode('HOPPER-20260315-abc')).toBeNull();
  });
});

describe('DailyLeaderboard', () => {
  beforeEach(() => {
    DailyLeaderboard.resetCache();
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hopper_daily_leaderboard');
    }
  });

  it('starts with empty leaderboard', () => {
    const scores = DailyLeaderboard.getToday();
    expect(scores).toHaveLength(0);
  });

  it('wouldRank returns true for empty board', () => {
    expect(DailyLeaderboard.wouldRank(100)).toBe(true);
  });

  it('getBest returns null for empty board', () => {
    expect(DailyLeaderboard.getBest()).toBeNull();
  });
});
