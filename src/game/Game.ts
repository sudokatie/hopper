// Hopper - Main Game Class

import { GameLoop } from './GameLoop';
import { Renderer } from './Renderer';
import { Input } from './Input';
import { Player } from './Player';
import { Lane, createDefaultLanes, createLanesForLevel, createDailyLanes } from './Lane';
import { todaySeed, todayString, DailyLeaderboard } from './Daily';
import { HomeManager } from './Home';
import { Score } from './Score';
import { getSoundSystem, type SoundSystem } from './Sound';
import {
  Achievement,
  getAchievementManager,
  AchievementManager,
} from './Achievements';
import {
  INITIAL_LIVES,
  INITIAL_TIME,
  RIVER_ROWS,
  ROAD_ROWS,
  CANVAS_WIDTH,
  CELL_SIZE,
  GRID_COLS,
} from './constants';
import type { GameState, GameStatus, Direction } from './types';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameLoop: GameLoop;
  private renderer: Renderer;
  private input: Input;
  private player: Player;
  private homeManager: HomeManager;
  private scoreManager: Score;
  private sound: SoundSystem;

  private lives: number = INITIAL_LIVES;
  private level: number = 1;
  private timeRemaining: number = INITIAL_TIME;
  private maxTime: number = INITIAL_TIME;
  private status: GameStatus = 'title';
  private paused: boolean = false;
  private laneObjects: Lane[] = [];
  private furthestRow: number = 13; // Track furthest row reached for scoring
  private deathCause: 'vehicle' | 'water' | 'timeout' | null = null;

  // Daily challenge state
  private dailyMode: boolean = false;
  private dailySeed: number = 0;
  private dailyDate: string = '';

  // Achievement tracking
  private achievements: AchievementManager;
  private deathsThisLevel: number = 0;
  private deathsThisGame: number = 0;
  private visitedColumns: Set<number> = new Set();
  private crossedRoadLanes: Set<number> = new Set();
  private logRideStartX: number | null = null;
  private hasHopped: boolean = false;

  onStateChange?: (state: GameState) => void;
  onAchievementUnlocked?: (achievement: Achievement) => void;

  // Calculate time limit for level: -2s per level, min 30s
  private getTimeLimitForLevel(level: number): number {
    return Math.max(30, INITIAL_TIME - (level - 1) * 2);
  }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;

    this.renderer = new Renderer(ctx);
    this.input = new Input();
    this.player = new Player();
    this.homeManager = new HomeManager();
    this.scoreManager = new Score();
    this.sound = getSoundSystem();
    this.achievements = getAchievementManager();
    this.gameLoop = new GameLoop(this.update.bind(this), this.render.bind(this));

    // Initialize lanes
    this.laneObjects = createDefaultLanes();

    // Set up input handlers
    this.input.onDirection(this.handleDirection.bind(this));
    this.input.onAction(this.handleAction.bind(this));
  }

  start(): void {
    this.input.attach();
    this.gameLoop.start();
  }

  stop(): void {
    this.gameLoop.stop();
    this.input.detach();
  }

  reset(): void {
    this.scoreManager.reset();
    this.lives = INITIAL_LIVES;
    this.level = 1;
    this.maxTime = this.getTimeLimitForLevel(1);
    this.timeRemaining = this.maxTime;
    this.furthestRow = 13;
    this.paused = false;
    this.deathCause = null;
    this.dailyMode = false;
    this.dailySeed = 0;
    this.dailyDate = '';
    // Reset achievement tracking
    this.deathsThisLevel = 0;
    this.deathsThisGame = 0;
    this.visitedColumns.clear();
    this.crossedRoadLanes.clear();
    this.logRideStartX = null;
    this.hasHopped = false;
    this.player.respawn();
    this.homeManager.reset();
    this.laneObjects = createDefaultLanes();
    this.status = 'playing';
  }

  /** Start a daily challenge run */
  startDaily(): void {
    this.scoreManager.reset();
    this.lives = INITIAL_LIVES;
    this.level = 1;
    this.maxTime = this.getTimeLimitForLevel(1);
    this.timeRemaining = this.maxTime;
    this.furthestRow = 13;
    this.paused = false;
    this.deathCause = null;
    this.dailyMode = true;
    this.dailySeed = todaySeed();
    this.dailyDate = todayString();
    // Reset achievement tracking
    this.deathsThisLevel = 0;
    this.deathsThisGame = 0;
    this.visitedColumns.clear();
    this.crossedRoadLanes.clear();
    this.logRideStartX = null;
    this.hasHopped = false;
    this.player.respawn();
    this.homeManager.reset();
    this.laneObjects = createDailyLanes(this.dailySeed, 1);
    this.status = 'playing';
  }

  /** Check if currently in daily mode */
  isDailyMode(): boolean {
    return this.dailyMode;
  }

  /** Get today's daily leaderboard */
  getDailyLeaderboard(): ReturnType<typeof DailyLeaderboard.getToday> {
    return DailyLeaderboard.getToday();
  }

  toggleSound(): boolean {
    const newState = !this.sound.isEnabled();
    this.sound.setEnabled(newState);
    return newState;
  }

  isSoundEnabled(): boolean {
    return this.sound.isEnabled();
  }

  setVolume(volume: number): void {
    this.sound.setVolume(volume);
  }

  getVolume(): number {
    return this.sound.getVolume();
  }

  getState(): GameState {
    return {
      player: this.player.getState(),
      score: this.scoreManager.getScore(),
      highScore: this.scoreManager.getHighScore(),
      lives: this.lives,
      level: this.level,
      timeRemaining: this.timeRemaining,
      maxTime: this.maxTime,
      lanes: this.laneObjects.map(l => l.getState()),
      homes: this.homeManager.getState(),
      status: this.status,
      paused: this.paused,
    };
  }

  private update(deltaTime: number): void {
    if (this.status !== 'playing' || this.paused) return;

    // Update player
    this.player.update(deltaTime);

    // Update lanes
    for (const lane of this.laneObjects) {
      lane.update(deltaTime);
    }

    // Check collisions
    this.checkCollisions();

    // Check if player carried offscreen by log
    this.checkOffscreenDeath();

    // Update timer
    this.timeRemaining -= deltaTime / 1000;
    if (this.timeRemaining <= 0) {
      this.deathCause = 'timeout';
      this.handleDeath();
      return;
    }

    // Emit state change
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  private checkOffscreenDeath(): void {
    const playerState = this.player.getState();
    if (playerState.ridingObject) {
      const objX = playerState.ridingObject.x;
      const objWidth = playerState.ridingObject.width * CELL_SIZE;
      // If log has moved completely offscreen with player on it
      if (objX + objWidth < 0 || objX > CANVAS_WIDTH) {
        this.deathCause = 'water';
        this.handleDeath();
      }
    }
  }

  private checkCollisions(): void {
    const playerPos = this.player.getPosition();
    const playerHitbox = this.player.getHitbox();

    // Check road collisions
    if (ROAD_ROWS.includes(playerPos.y)) {
      const lane = this.laneObjects.find(l => l.getRow() === playerPos.y);
      if (lane) {
        for (const obj of lane.getObjects()) {
          if (this.rectanglesOverlap(playerHitbox, obj.getHitbox())) {
            this.deathCause = 'vehicle';
            this.handleDeath();
            return;
          }
        }
      }
    }

    // Check river collisions
    if (RIVER_ROWS.includes(playerPos.y)) {
      const lane = this.laneObjects.find(l => l.getRow() === playerPos.y);
      if (lane) {
        let onLog = false;
        for (const obj of lane.getObjects()) {
          if (this.rectanglesOverlap(playerHitbox, obj.getHitbox())) {
            onLog = true;
            this.player.updateRiding(obj.getState());
            break;
          }
        }
        if (!onLog) {
          // In water - death!
          this.deathCause = 'water';
          this.handleDeath();
          return;
        }
      } else {
        // No lane found for this row - shouldn't happen but treat as water
        this.deathCause = 'water';
        this.handleDeath();
        return;
      }
    } else {
      // Not on river, clear riding state
      this.player.updateRiding(null);
    }
  }

  private rectanglesOverlap(a: { x: number; y: number; width: number; height: number },
                            b: { x: number; y: number; width: number; height: number }): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  private render(): void {
    this.renderer.clear();
    this.renderer.drawBackground();
    this.renderer.drawHomes(this.homeManager.getState());
    this.renderer.drawLanes(this.laneObjects.map(l => l.getState()));
    this.renderer.drawPlayer(this.player.getState(), this.status);
  }

  private fireAchievement(achievement: Achievement): void {
    if (this.onAchievementUnlocked) {
      this.onAchievementUnlocked(achievement);
    }
  }

  private checkAchievements(ids: string[]): void {
    for (const id of ids) {
      const unlocked = this.achievements.unlock(id);
      if (unlocked) {
        this.fireAchievement(unlocked);
      }
    }
  }

  private handleDirection(direction: Direction): void {
    if (this.status !== 'playing') return;

    const hopped = this.player.hop(direction);

    if (hopped) {
      this.sound.play('hop');
      const pos = this.player.getPosition();
      const newY = pos.y;
      const newX = pos.x;

      // First hop achievement
      if (!this.hasHopped) {
        this.hasHopped = true;
        this.checkAchievements(['first_hop']);
      }

      // Track visited columns for edge hopper achievement
      this.visitedColumns.add(newX);
      if (this.visitedColumns.has(0) && this.visitedColumns.has(GRID_COLS - 1)) {
        this.checkAchievements(['edge_hopper']);
      }

      // Track road lanes crossed
      if (ROAD_ROWS.includes(newY)) {
        this.crossedRoadLanes.add(newY);
        if (this.crossedRoadLanes.size === ROAD_ROWS.length) {
          this.checkAchievements(['all_lanes']);
        }
      }

      // Track log riding start position
      if (RIVER_ROWS.includes(newY) && this.logRideStartX === null) {
        this.logRideStartX = newX;
      } else if (!RIVER_ROWS.includes(newY)) {
        this.logRideStartX = null;
      }

      // Score for moving forward (up)
      if (direction === 'up' && newY < this.furthestRow) {
        this.scoreManager.addHopForward();
        this.furthestRow = newY;
      }

      // Check if reached home row
      if (newY === 0) {
        this.checkHomeReached();
      }
    }
  }

  private handleAction(action: 'start' | 'pause'): void {
    if (action === 'start') {
      if (this.status === 'title' || this.status === 'gameover') {
        this.reset();
      } else if (this.status === 'playing' && this.paused) {
        // Unpause with space too
        this.paused = false;
      }
    } else if (action === 'pause') {
      if (this.status === 'playing') {
        this.paused = !this.paused;
      }
    }
  }

  private handleDeath(): void {
    // Play death sound based on cause
    if (this.deathCause === 'water') {
      this.sound.play('splash');
    } else {
      this.sound.play('splat');
    }
    this.deathCause = null;

    this.player.die();
    this.lives--;
    this.deathsThisLevel++;
    this.deathsThisGame++;
    this.status = 'dying';

    // Reset per-life tracking
    this.crossedRoadLanes.clear();
    this.logRideStartX = null;

    // After death animation, check game over or respawn
    setTimeout(() => {
      if (this.lives <= 0) {
        this.status = 'gameover';
        this.sound.play('gameOver');
        this.scoreManager.checkHighScore();

        // Check score achievements
        const score = this.scoreManager.getScore();
        const achievementsToCheck: string[] = [];
        if (score >= 1000) achievementsToCheck.push('score_1000');
        if (score >= 5000) achievementsToCheck.push('score_5000');
        if (score >= 10000) achievementsToCheck.push('score_10000');
        this.checkAchievements(achievementsToCheck);

        // Record to daily leaderboard if in daily mode
        if (this.dailyMode) {
          const filledCount = this.homeManager.getState().filter(h => h.filled).length;
          const rank = DailyLeaderboard.recordScore(
            'Player', // Name - UI should prompt for this
            this.scoreManager.getScore(),
            this.level,
            filledCount
          );
          // Check daily achievements
          const dailyAchievements = this.achievements.recordDailyCompletion(rank);
          for (const a of dailyAchievements) {
            this.fireAchievement(a);
          }
        }
      } else {
        this.player.respawn();
        this.timeRemaining = this.maxTime; // Use level-appropriate time
        this.furthestRow = 13;
        this.status = 'playing';
      }
    }, 500);
  }

  private checkHomeReached(): void {
    const pos = this.player.getPosition();

    // Find which home slot (if any) the player landed on
    const homeIndex = this.homeManager.findHomeAtColumn(pos.x);

    if (homeIndex >= 0) {
      // Fill the home
      this.sound.play('home');
      this.homeManager.fillHome(homeIndex);
      this.scoreManager.addHome();

      // Achievement: first home
      this.checkAchievements(['home_safe']);

      // Achievement: speed demon (50+ seconds remaining)
      if (this.timeRemaining >= 50) {
        this.checkAchievements(['speed_demon']);
      }

      // Achievement: close call (less than 5 seconds remaining)
      if (this.timeRemaining < 5) {
        this.checkAchievements(['close_call']);
      }

      // Achievement: log rider (rode across entire river)
      // Check if we traveled significant horizontal distance on logs
      if (this.logRideStartX !== null) {
        const rideDistance = Math.abs(pos.x - this.logRideStartX);
        if (rideDistance >= 8) {
          // Rode at least 8 cells (more than half the width)
          this.checkAchievements(['log_rider']);
        }
      }

      // Check if all homes filled
      if (this.homeManager.allHomesFilled()) {
        this.advanceLevel();
      } else {
        // Respawn for next attempt
        this.player.respawn();
        this.timeRemaining = this.maxTime; // Use level-appropriate time
        this.furthestRow = 13;
        this.crossedRoadLanes.clear();
        this.logRideStartX = null;
      }
    } else {
      // Landed on invalid spot - death
      this.deathCause = 'vehicle'; // Treat as splat
      this.handleDeath();
    }
  }

  private advanceLevel(): void {
    this.sound.play('levelUp');
    this.scoreManager.addAllHomes(); // Bonus for completing level
    this.scoreManager.addTimeBonus(this.timeRemaining); // Time bonus

    // Check level completion achievements
    const achievementsToCheck: string[] = ['level_complete'];

    // Perfect level (no deaths this level)
    if (this.deathsThisLevel === 0) {
      achievementsToCheck.push('perfect_level');
    }

    // Level milestones
    if (this.level === 1) {
      // Completing level 1 means we're going to level 2
    }
    if (this.level >= 4 && this.deathsThisGame === 0) {
      // No deaths and reached level 5 (after completing level 4)
      achievementsToCheck.push('no_death_level_3');
    }

    this.checkAchievements(achievementsToCheck);

    this.level++;

    // Check level milestones after incrementing
    const levelAchievements: string[] = [];
    if (this.level >= 5) levelAchievements.push('level_5');
    if (this.level >= 10) levelAchievements.push('level_10');
    this.checkAchievements(levelAchievements);

    // Reset per-level tracking
    this.deathsThisLevel = 0;
    this.crossedRoadLanes.clear();
    this.logRideStartX = null;

    this.homeManager.reset();
    // Use seeded lanes in daily mode
    this.laneObjects = this.dailyMode
      ? createDailyLanes(this.dailySeed, this.level)
      : createLanesForLevel(this.level);
    this.player.respawn();
    this.maxTime = this.getTimeLimitForLevel(this.level);
    this.timeRemaining = this.maxTime;
    this.furthestRow = 13;
    this.status = 'levelcomplete';

    // After brief pause, continue playing
    setTimeout(() => {
      this.status = 'playing';
    }, 2000);
  }
}
