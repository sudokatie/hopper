/**
 * Tests for the Achievement system
 */

import {
  ACHIEVEMENTS,
  AchievementManager,
  getAchievementManager,
} from '../game/Achievements';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Achievements', () => {
  let manager: AchievementManager;

  beforeEach(() => {
    localStorageMock.clear();
    manager = new AchievementManager();
  });

  describe('ACHIEVEMENTS constant', () => {
    it('contains at least 20 achievements', () => {
      expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(20);
    });

    it('has unique ids for all achievements', () => {
      const ids = ACHIEVEMENTS.map((a) => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('has all required fields for each achievement', () => {
      for (const achievement of ACHIEVEMENTS) {
        expect(achievement.id).toBeDefined();
        expect(achievement.name).toBeDefined();
        expect(achievement.description).toBeDefined();
        expect(achievement.icon).toBeDefined();
        expect(achievement.category).toBeDefined();
        expect(['skill', 'exploration', 'mastery', 'daily']).toContain(
          achievement.category
        );
      }
    });
  });

  describe('AchievementManager', () => {
    it('starts with no achievements unlocked', () => {
      expect(manager.getUnlockedCount()).toBe(0);
    });

    it('returns total achievement count', () => {
      expect(manager.getTotalCount()).toBe(ACHIEVEMENTS.length);
    });

    it('can unlock an achievement', () => {
      const result = manager.unlock('first_hop');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('first_hop');
      expect(manager.isUnlocked('first_hop')).toBe(true);
      expect(manager.getUnlockedCount()).toBe(1);
    });

    it('returns null when unlocking already unlocked achievement', () => {
      manager.unlock('first_hop');
      const result = manager.unlock('first_hop');
      expect(result).toBeNull();
      expect(manager.getUnlockedCount()).toBe(1);
    });

    it('returns null when unlocking unknown achievement id', () => {
      const result = manager.unlock('fake_achievement');
      expect(result).toBeNull();
      expect(manager.getUnlockedCount()).toBe(0);
    });

    it('can check and unlock multiple achievements', () => {
      const results = manager.checkAndUnlock([
        'first_hop',
        'home_safe',
        'fake_id',
      ]);
      expect(results.length).toBe(2);
      expect(results.map((a) => a.id)).toContain('first_hop');
      expect(results.map((a) => a.id)).toContain('home_safe');
      expect(manager.getUnlockedCount()).toBe(2);
    });

    it('persists achievements to localStorage', () => {
      manager.unlock('first_hop');

      // Create new manager to test persistence
      const manager2 = new AchievementManager();
      expect(manager2.isUnlocked('first_hop')).toBe(true);
    });

    it('can get achievement by id', () => {
      const achievement = manager.getAchievement('level_5');
      expect(achievement).toBeDefined();
      expect(achievement?.name).toBe('Veteran');
    });

    it('returns undefined for unknown achievement id', () => {
      const achievement = manager.getAchievement('fake_id');
      expect(achievement).toBeUndefined();
    });

    it('can reset all progress', () => {
      manager.unlock('first_hop');
      manager.unlock('home_safe');
      expect(manager.getUnlockedCount()).toBe(2);

      manager.reset();
      expect(manager.getUnlockedCount()).toBe(0);
    });

    it('tracks unlock timestamp', () => {
      const before = Date.now();
      manager.unlock('first_hop');
      const after = Date.now();

      const progress = manager.getProgress();
      expect(progress['first_hop']).toBeDefined();
      expect(progress['first_hop'].unlockedAt).toBeGreaterThanOrEqual(before);
      expect(progress['first_hop'].unlockedAt).toBeLessThanOrEqual(after);
    });
  });

  describe('Daily achievements', () => {
    it('records daily completion and unlocks daily_complete', () => {
      const results = manager.recordDailyCompletion(5);
      expect(results.some((a) => a.id === 'daily_complete')).toBe(true);
    });

    it('unlocks top 10 achievement for rank <= 10', () => {
      const results = manager.recordDailyCompletion(10);
      expect(results.some((a) => a.id === 'daily_top_10')).toBe(true);
    });

    it('unlocks top 3 achievement for rank <= 3', () => {
      const results = manager.recordDailyCompletion(3);
      expect(results.some((a) => a.id === 'daily_top_3')).toBe(true);
    });

    it('unlocks first place achievement for rank 1', () => {
      const results = manager.recordDailyCompletion(1);
      expect(results.some((a) => a.id === 'daily_first')).toBe(true);
    });

    it('does not unlock rank achievements for rank > 10', () => {
      const results = manager.recordDailyCompletion(15);
      expect(results.some((a) => a.id === 'daily_top_10')).toBe(false);
      expect(results.some((a) => a.id === 'daily_top_3')).toBe(false);
      expect(results.some((a) => a.id === 'daily_first')).toBe(false);
    });
  });

  describe('getAchievementManager singleton', () => {
    it('returns the same instance', () => {
      const manager1 = getAchievementManager();
      const manager2 = getAchievementManager();
      expect(manager1).toBe(manager2);
    });
  });
});
