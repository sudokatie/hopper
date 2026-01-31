// Hopper - Player Entity

import {
  PLAYER_START,
  CELL_SIZE,
  GRID_COLS,
  GRID_ROWS,
  HOP_DURATION_MS,
  HOP_COOLDOWN_MS,
  PLAYER_HITBOX_SCALE,
} from './constants';
import type { Position, Direction, PlayerState, Rectangle, MovingObjectState } from './types';

export class Player {
  private position: Position;
  private alive: boolean = true;
  private ridingObject: MovingObjectState | null = null;
  private hopping: boolean = false;
  private hopProgress: number = 0;
  private hopDirection: Direction | null = null;
  private hopStart: Position | null = null;
  private hopCooldown: number = 0;

  constructor() {
    this.position = { ...PLAYER_START };
  }

  hop(direction: Direction): boolean {
    // Cannot hop if dead, already hopping, or on cooldown
    if (!this.alive || this.hopping || this.hopCooldown > 0) {
      return false;
    }

    // Calculate target position
    const target = { ...this.position };
    switch (direction) {
      case 'up':
        target.y -= 1;
        break;
      case 'down':
        target.y += 1;
        break;
      case 'left':
        target.x -= 1;
        break;
      case 'right':
        target.x += 1;
        break;
    }

    // Check boundaries
    if (!this.isValidPosition(target)) {
      return false;
    }

    // Start hop animation
    this.hopStart = { ...this.position };
    this.hopDirection = direction;
    this.hopping = true;
    this.hopProgress = 0;
    this.position = target;

    return true;
  }

  update(deltaTime: number): void {
    // Update hop animation
    if (this.hopping) {
      this.hopProgress += deltaTime / HOP_DURATION_MS;
      if (this.hopProgress >= 1) {
        this.hopProgress = 1;
        this.hopping = false;
        this.hopStart = null;
        this.hopDirection = null;
        this.hopCooldown = HOP_COOLDOWN_MS;
      }
    }

    // Update cooldown
    if (this.hopCooldown > 0) {
      this.hopCooldown = Math.max(0, this.hopCooldown - deltaTime);
    }
  }

  updateRiding(movingObject: MovingObjectState | null): void {
    this.ridingObject = movingObject;
  }

  die(): void {
    this.alive = false;
  }

  respawn(): void {
    this.position = { ...PLAYER_START };
    this.alive = true;
    this.ridingObject = null;
    this.hopping = false;
    this.hopProgress = 0;
    this.hopDirection = null;
    this.hopStart = null;
    this.hopCooldown = 0;
  }

  getPosition(): Position {
    return { ...this.position };
  }

  getHitbox(): Rectangle {
    const size = CELL_SIZE * PLAYER_HITBOX_SCALE;
    const offset = (CELL_SIZE - size) / 2;

    let x = this.position.x * CELL_SIZE + offset;
    const y = this.position.y * CELL_SIZE + offset;

    // If riding, adjust x based on riding object
    if (this.ridingObject) {
      // Player's grid x is relative to the log
      x = this.ridingObject.x + offset;
    }

    return {
      x,
      y,
      width: size,
      height: size,
    };
  }

  getState(): PlayerState {
    return {
      position: { ...this.position },
      alive: this.alive,
      ridingObject: this.ridingObject,
      hopping: this.hopping,
      hopProgress: this.hopProgress,
      hopDirection: this.hopDirection,
      hopStart: this.hopStart ? { ...this.hopStart } : null,
    };
  }

  isAlive(): boolean {
    return this.alive;
  }

  private isValidPosition(pos: Position): boolean {
    // Check grid boundaries
    if (pos.x < 0 || pos.x >= GRID_COLS) return false;
    if (pos.y < 0 || pos.y >= GRID_ROWS) return false;
    return true;
  }
}
