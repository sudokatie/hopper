// Hopper - Main Game Class

import { GameLoop } from './GameLoop';
import { Renderer } from './Renderer';
import { Input } from './Input';
import { Player } from './Player';
import {
  HOME_COLUMNS,
  INITIAL_LIVES,
  INITIAL_TIME,
  POINTS_HOP_FORWARD,
} from './constants';
import type { GameState, GameStatus, Direction, HomeState, LaneState } from './types';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameLoop: GameLoop;
  private renderer: Renderer;
  private input: Input;
  private player: Player;

  private score: number = 0;
  private highScore: number = 0;
  private lives: number = INITIAL_LIVES;
  private level: number = 1;
  private timeRemaining: number = INITIAL_TIME;
  private maxTime: number = INITIAL_TIME;
  private status: GameStatus = 'title';
  private homes: HomeState[] = [];
  private lanes: LaneState[] = [];
  private furthestRow: number = 13; // Track furthest row reached for scoring

  onStateChange?: (state: GameState) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;

    this.renderer = new Renderer(ctx);
    this.input = new Input();
    this.player = new Player();
    this.gameLoop = new GameLoop(this.update.bind(this), this.render.bind(this));

    // Initialize homes
    this.homes = HOME_COLUMNS.map(col => ({ column: col, filled: false }));

    // Load high score
    this.loadHighScore();

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
    this.score = 0;
    this.lives = INITIAL_LIVES;
    this.level = 1;
    this.timeRemaining = INITIAL_TIME;
    this.furthestRow = 13;
    this.player.respawn();
    this.homes = HOME_COLUMNS.map(col => ({ column: col, filled: false }));
    this.status = 'playing';
  }

  getState(): GameState {
    return {
      player: this.player.getState(),
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level,
      timeRemaining: this.timeRemaining,
      maxTime: this.maxTime,
      lanes: this.lanes,
      homes: this.homes,
      status: this.status,
    };
  }

  private update(deltaTime: number): void {
    if (this.status !== 'playing') return;

    // Update player
    this.player.update(deltaTime);

    // Update timer
    this.timeRemaining -= deltaTime / 1000;
    if (this.timeRemaining <= 0) {
      this.handleDeath();
      return;
    }

    // Emit state change
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  private render(): void {
    this.renderer.clear();
    this.renderer.drawBackground();
    this.renderer.drawHomes(this.homes);
    this.renderer.drawLanes(this.lanes);
    this.renderer.drawPlayer(this.player.getState(), this.status);
  }

  private handleDirection(direction: Direction): void {
    if (this.status !== 'playing') return;

    const hopped = this.player.hop(direction);

    if (hopped) {
      const newY = this.player.getPosition().y;

      // Score for moving forward (up)
      if (direction === 'up' && newY < this.furthestRow) {
        this.score += POINTS_HOP_FORWARD;
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
      }
    }
  }

  private handleDeath(): void {
    this.player.die();
    this.lives--;
    this.status = 'dying';

    // After death animation, check game over or respawn
    setTimeout(() => {
      if (this.lives <= 0) {
        this.status = 'gameover';
        this.checkHighScore();
      } else {
        this.player.respawn();
        this.timeRemaining = INITIAL_TIME;
        this.furthestRow = 13;
        this.status = 'playing';
      }
    }, 500);
  }

  private checkHomeReached(): void {
    const pos = this.player.getPosition();

    // Find which home slot (if any) the player landed on
    const homeIndex = this.homes.findIndex(h => h.column === pos.x && !h.filled);

    if (homeIndex >= 0) {
      // Fill the home
      this.homes[homeIndex].filled = true;
      this.score += 50;

      // Check if all homes filled
      if (this.homes.every(h => h.filled)) {
        this.advanceLevel();
      } else {
        // Respawn for next attempt
        this.player.respawn();
        this.timeRemaining = INITIAL_TIME;
        this.furthestRow = 13;
      }
    } else {
      // Landed on invalid spot - death
      this.handleDeath();
    }
  }

  private advanceLevel(): void {
    this.score += 1000; // Bonus for completing level
    this.score += Math.floor(this.timeRemaining) * 10; // Time bonus
    this.level++;
    this.homes = HOME_COLUMNS.map(col => ({ column: col, filled: false }));
    this.player.respawn();
    this.timeRemaining = INITIAL_TIME;
    this.furthestRow = 13;
    this.status = 'levelcomplete';

    // After brief pause, continue playing
    setTimeout(() => {
      this.status = 'playing';
    }, 2000);
  }

  private loadHighScore(): void {
    try {
      const saved = localStorage.getItem('hopper_high_score');
      if (saved) {
        this.highScore = parseInt(saved, 10);
      }
    } catch {
      // localStorage not available
    }
  }

  private checkHighScore(): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      try {
        localStorage.setItem('hopper_high_score', String(this.highScore));
      } catch {
        // localStorage not available
      }
    }
  }
}
