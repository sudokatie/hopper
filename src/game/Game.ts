// Hopper - Main Game Class

import { GameLoop } from './GameLoop';
import { Renderer } from './Renderer';
import { Input } from './Input';
import { Player } from './Player';
import { Lane, createDefaultLanes, createLanesForLevel } from './Lane';
import { HomeManager } from './Home';
import { Score } from './Score';
import {
  INITIAL_LIVES,
  INITIAL_TIME,
  RIVER_ROWS,
  ROAD_ROWS,
  CANVAS_WIDTH,
  CELL_SIZE,
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

  private lives: number = INITIAL_LIVES;
  private level: number = 1;
  private timeRemaining: number = INITIAL_TIME;
  private maxTime: number = INITIAL_TIME;
  private status: GameStatus = 'title';
  private paused: boolean = false;
  private laneObjects: Lane[] = [];
  private furthestRow: number = 13; // Track furthest row reached for scoring

  onStateChange?: (state: GameState) => void;

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
    this.player.respawn();
    this.homeManager.reset();
    this.laneObjects = createDefaultLanes();
    this.status = 'playing';
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
          this.handleDeath();
          return;
        }
      } else {
        // No lane found for this row - shouldn't happen but treat as water
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

  private handleDirection(direction: Direction): void {
    if (this.status !== 'playing') return;

    const hopped = this.player.hop(direction);

    if (hopped) {
      const newY = this.player.getPosition().y;

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
    this.player.die();
    this.lives--;
    this.status = 'dying';

    // After death animation, check game over or respawn
    setTimeout(() => {
      if (this.lives <= 0) {
        this.status = 'gameover';
        this.scoreManager.checkHighScore();
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
      this.homeManager.fillHome(homeIndex);
      this.scoreManager.addHome();

      // Check if all homes filled
      if (this.homeManager.allHomesFilled()) {
        this.advanceLevel();
      } else {
        // Respawn for next attempt
        this.player.respawn();
        this.timeRemaining = this.maxTime; // Use level-appropriate time
        this.furthestRow = 13;
      }
    } else {
      // Landed on invalid spot - death
      this.handleDeath();
    }
  }

  private advanceLevel(): void {
    this.scoreManager.addAllHomes(); // Bonus for completing level
    this.scoreManager.addTimeBonus(this.timeRemaining); // Time bonus
    this.level++;
    this.homeManager.reset();
    this.laneObjects = createLanesForLevel(this.level); // Scale difficulty
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
