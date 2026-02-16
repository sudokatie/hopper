/**
 * @jest-environment jsdom
 */

import { Leaderboard } from '../game/Leaderboard';

describe('Leaderboard', () => {
  beforeEach(() => {
    localStorage.clear();
    Leaderboard.resetCache();
  });

  describe('load', () => {
    it('should return empty array when no data', () => {
      expect(Leaderboard.load()).toEqual([]);
    });

    it('should load existing data', () => {
      const data = [{ name: 'Froggy', score: 2000, level: 3, frogsHome: 15, completedAt: '2026-01-01' }];
      localStorage.setItem('hopper_leaderboard', JSON.stringify(data));
      Leaderboard.resetCache();
      expect(Leaderboard.load()[0].name).toBe('Froggy');
    });
  });

  describe('recordScore', () => {
    it('should add new high score', () => {
      const rank = Leaderboard.recordScore('Hopper', 5000, 5, 25);
      expect(rank).toBe(1);
      expect(Leaderboard.getTop()[0].score).toBe(5000);
      expect(Leaderboard.getTop()[0].frogsHome).toBe(25);
    });

    it('should sort by score descending', () => {
      Leaderboard.recordScore('Slow', 500, 1, 5);
      Leaderboard.recordScore('Fast', 10000, 8, 40);
      Leaderboard.recordScore('Medium', 3000, 4, 18);
      
      const top = Leaderboard.getTop();
      expect(top[0].name).toBe('Fast');
      expect(top[1].name).toBe('Medium');
      expect(top[2].name).toBe('Slow');
    });

    it('should limit to max entries', () => {
      for (let i = 0; i < 15; i++) {
        Leaderboard.recordScore(`Frog${i}`, i * 500, i, i * 5);
      }
      expect(Leaderboard.getTop().length).toBe(10);
    });

    it('should persist to localStorage', () => {
      Leaderboard.recordScore('Saved', 2500, 3, 12);
      const stored = JSON.parse(localStorage.getItem('hopper_leaderboard')!);
      expect(stored[0].name).toBe('Saved');
    });
  });

  describe('wouldRank', () => {
    it('should return true when not full', () => {
      expect(Leaderboard.wouldRank(100)).toBe(true);
    });

    it('should check against worst when full', () => {
      for (let i = 0; i < 10; i++) {
        Leaderboard.recordScore(`P${i}`, 5000 + i * 500, i, i * 5);
      }
      expect(Leaderboard.wouldRank(10000)).toBe(true);
      expect(Leaderboard.wouldRank(1000)).toBe(false);
    });
  });

  describe('getBest', () => {
    it('should return best score', () => {
      Leaderboard.recordScore('Second', 3000, 3, 15);
      Leaderboard.recordScore('First', 8000, 7, 35);
      expect(Leaderboard.getBest()?.name).toBe('First');
    });

    it('should return null when empty', () => {
      expect(Leaderboard.getBest()).toBeNull();
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      Leaderboard.recordScore('Gone', 1000, 1, 5);
      Leaderboard.clear();
      expect(Leaderboard.getTop().length).toBe(0);
    });
  });
});
