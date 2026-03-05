/**
 * Achievement system for Hopper
 * Tracks and persists player accomplishments
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'skill' | 'exploration' | 'mastery' | 'daily';
  hidden?: boolean;
}

export interface AchievementProgress {
  unlockedAt: number; // timestamp
}

export type AchievementStore = Record<string, AchievementProgress>;

// Hopper achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Skill achievements
  {
    id: 'first_hop',
    name: 'Baby Steps',
    description: 'Complete your first hop',
    icon: '🐸',
    category: 'skill',
  },
  {
    id: 'home_safe',
    name: 'Home Safe',
    description: 'Reach a home for the first time',
    icon: '🏠',
    category: 'skill',
  },
  {
    id: 'level_complete',
    name: 'Road Warrior',
    description: 'Complete level 1',
    icon: '🛣️',
    category: 'skill',
  },
  {
    id: 'perfect_level',
    name: 'Untouchable',
    description: 'Complete a level without dying',
    icon: '⭐',
    category: 'skill',
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Reach a home with 50+ seconds remaining',
    icon: '⚡',
    category: 'skill',
  },
  {
    id: 'close_call',
    name: 'Close Call',
    description: 'Reach a home with less than 5 seconds remaining',
    icon: '😰',
    category: 'skill',
  },

  // Exploration achievements
  {
    id: 'log_rider',
    name: 'Log Rider',
    description: 'Ride a log across the entire river',
    icon: '🪵',
    category: 'exploration',
  },
  {
    id: 'all_lanes',
    name: 'Traffic Navigator',
    description: 'Cross all road lanes in a single life',
    icon: '🚗',
    category: 'exploration',
  },
  {
    id: 'edge_hopper',
    name: 'Living on the Edge',
    description: 'Hop to both edge columns (0 and 12) in one game',
    icon: '↔️',
    category: 'exploration',
  },

  // Mastery achievements
  {
    id: 'level_5',
    name: 'Veteran',
    description: 'Reach level 5',
    icon: '🎖️',
    category: 'mastery',
  },
  {
    id: 'level_10',
    name: 'Master Hopper',
    description: 'Reach level 10',
    icon: '👑',
    category: 'mastery',
  },
  {
    id: 'score_1000',
    name: 'Thousand Club',
    description: 'Score 1,000 points',
    icon: '💯',
    category: 'mastery',
  },
  {
    id: 'score_5000',
    name: 'High Scorer',
    description: 'Score 5,000 points',
    icon: '🏆',
    category: 'mastery',
  },
  {
    id: 'score_10000',
    name: 'Legend',
    description: 'Score 10,000 points',
    icon: '🌟',
    category: 'mastery',
  },
  {
    id: 'no_death_level_3',
    name: 'Frogger Pro',
    description: 'Reach level 3 without dying',
    icon: '🎯',
    category: 'mastery',
  },

  // Daily achievements
  {
    id: 'daily_complete',
    name: 'Daily Player',
    description: 'Complete a daily challenge',
    icon: '📅',
    category: 'daily',
  },
  {
    id: 'daily_top_10',
    name: 'Daily Contender',
    description: 'Finish in top 10 of daily challenge',
    icon: '🔟',
    category: 'daily',
  },
  {
    id: 'daily_top_3',
    name: 'Daily Champion',
    description: 'Finish in top 3 of daily challenge',
    icon: '🥉',
    category: 'daily',
  },
  {
    id: 'daily_first',
    name: 'Daily Legend',
    description: 'Get first place in daily challenge',
    icon: '🥇',
    category: 'daily',
  },
  {
    id: 'daily_streak_3',
    name: 'Consistent',
    description: 'Complete daily challenges 3 days in a row',
    icon: '🔥',
    category: 'daily',
  },
  {
    id: 'daily_streak_7',
    name: 'Dedicated',
    description: 'Complete daily challenges 7 days in a row',
    icon: '💪',
    category: 'daily',
  },
];

const STORAGE_KEY = 'hopper_achievements';
const STREAK_KEY = 'hopper_daily_streak';

export class AchievementManager {
  private store: AchievementStore;
  private dailyStreak: { lastDate: string; count: number };

  constructor() {
    this.store = this.load();
    this.dailyStreak = this.loadStreak();
  }

  private load(): AchievementStore {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store));
    } catch {
      // localStorage may be unavailable
    }
  }

  private loadStreak(): { lastDate: string; count: number } {
    try {
      const data = localStorage.getItem(STREAK_KEY);
      return data ? JSON.parse(data) : { lastDate: '', count: 0 };
    } catch {
      return { lastDate: '', count: 0 };
    }
  }

  private saveStreak(): void {
    try {
      localStorage.setItem(STREAK_KEY, JSON.stringify(this.dailyStreak));
    } catch {
      // localStorage may be unavailable
    }
  }

  isUnlocked(id: string): boolean {
    return id in this.store;
  }

  getProgress(): AchievementStore {
    return { ...this.store };
  }

  getUnlockedCount(): number {
    return Object.keys(this.store).length;
  }

  getTotalCount(): number {
    return ACHIEVEMENTS.length;
  }

  getAchievement(id: string): Achievement | undefined {
    return ACHIEVEMENTS.find((a) => a.id === id);
  }

  getAllAchievements(): Achievement[] {
    return ACHIEVEMENTS;
  }

  /**
   * Attempt to unlock an achievement. Returns the achievement if newly unlocked.
   */
  unlock(id: string): Achievement | null {
    if (this.isUnlocked(id)) {
      return null;
    }

    const achievement = this.getAchievement(id);
    if (!achievement) {
      return null;
    }

    this.store[id] = { unlockedAt: Date.now() };
    this.save();
    return achievement;
  }

  /**
   * Check and unlock multiple achievements. Returns array of newly unlocked.
   */
  checkAndUnlock(ids: string[]): Achievement[] {
    const unlocked: Achievement[] = [];
    for (const id of ids) {
      const achievement = this.unlock(id);
      if (achievement) {
        unlocked.push(achievement);
      }
    }
    return unlocked;
  }

  /**
   * Record daily challenge completion and check streak achievements.
   */
  recordDailyCompletion(rank: number): Achievement[] {
    const unlocked: Achievement[] = [];

    // Daily complete
    const daily = this.unlock('daily_complete');
    if (daily) unlocked.push(daily);

    // Rank achievements
    if (rank <= 10) {
      const top10 = this.unlock('daily_top_10');
      if (top10) unlocked.push(top10);
    }
    if (rank <= 3) {
      const top3 = this.unlock('daily_top_3');
      if (top3) unlocked.push(top3);
    }
    if (rank === 1) {
      const first = this.unlock('daily_first');
      if (first) unlocked.push(first);
    }

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split('T')[0];

    if (this.dailyStreak.lastDate === yesterday) {
      this.dailyStreak.count++;
    } else if (this.dailyStreak.lastDate !== today) {
      this.dailyStreak.count = 1;
    }
    this.dailyStreak.lastDate = today;
    this.saveStreak();

    // Streak achievements
    if (this.dailyStreak.count >= 3) {
      const streak3 = this.unlock('daily_streak_3');
      if (streak3) unlocked.push(streak3);
    }
    if (this.dailyStreak.count >= 7) {
      const streak7 = this.unlock('daily_streak_7');
      if (streak7) unlocked.push(streak7);
    }

    return unlocked;
  }

  /**
   * Reset all achievement progress (for testing/debug)
   */
  reset(): void {
    this.store = {};
    this.dailyStreak = { lastDate: '', count: 0 };
    this.save();
    this.saveStreak();
  }
}

// Singleton instance
let instance: AchievementManager | null = null;

export function getAchievementManager(): AchievementManager {
  if (!instance) {
    instance = new AchievementManager();
  }
  return instance;
}
