// Hopper - Scoring System

import {
  POINTS_HOP_FORWARD,
  POINTS_HOME,
  POINTS_ALL_HOMES,
  POINTS_TIME_BONUS,
  STORAGE_HIGH_SCORE,
} from './constants';

export class Score {
  private score: number = 0;
  private highScore: number = 0;

  constructor() {
    this.loadHighScore();
  }

  getScore(): number {
    return this.score;
  }

  getHighScore(): number {
    return this.highScore;
  }

  reset(): void {
    this.score = 0;
  }

  /**
   * Add points for hopping forward
   */
  addHopForward(): number {
    this.score += POINTS_HOP_FORWARD;
    return POINTS_HOP_FORWARD;
  }

  /**
   * Add points for filling a home
   */
  addHome(): number {
    this.score += POINTS_HOME;
    return POINTS_HOME;
  }

  /**
   * Add bonus for filling all homes
   */
  addAllHomes(): number {
    this.score += POINTS_ALL_HOMES;
    return POINTS_ALL_HOMES;
  }

  /**
   * Add time bonus at end of level
   */
  addTimeBonus(secondsRemaining: number): number {
    const bonus = Math.floor(secondsRemaining) * POINTS_TIME_BONUS;
    this.score += bonus;
    return bonus;
  }

  /**
   * Add arbitrary points
   */
  add(points: number): void {
    this.score += points;
  }

  /**
   * Check and update high score
   * Returns true if new high score
   */
  checkHighScore(): boolean {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
      return true;
    }
    return false;
  }

  private loadHighScore(): void {
    try {
      const saved = localStorage.getItem(STORAGE_HIGH_SCORE);
      if (saved) {
        this.highScore = parseInt(saved, 10);
      }
    } catch {
      // localStorage not available
    }
  }

  private saveHighScore(): void {
    try {
      localStorage.setItem(STORAGE_HIGH_SCORE, String(this.highScore));
    } catch {
      // localStorage not available
    }
  }
}

/**
 * Calculate score for completing a level
 */
export function calculateLevelScore(timeRemaining: number): {
  levelBonus: number;
  timeBonus: number;
  total: number;
} {
  const levelBonus = POINTS_ALL_HOMES;
  const timeBonus = Math.floor(timeRemaining) * POINTS_TIME_BONUS;
  return {
    levelBonus,
    timeBonus,
    total: levelBonus + timeBonus,
  };
}
