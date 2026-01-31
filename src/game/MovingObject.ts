// Hopper - Moving Object (Cars, Trucks, Logs)

import { CELL_SIZE, CANVAS_WIDTH } from './constants';
import type { ObjectType, MovingObjectState, Rectangle } from './types';

export interface MovingObjectConfig {
  type: ObjectType;
  y: number;
  width: number;
  speed: number;
  direction: 'left' | 'right';
  variant?: number;
}

export class MovingObject {
  private type: ObjectType;
  private x: number;
  private y: number;
  private width: number;
  private speed: number;
  private direction: 'left' | 'right';
  private variant: number;

  constructor(config: MovingObjectConfig) {
    this.type = config.type;
    this.y = config.y;
    this.width = config.width;
    this.speed = config.speed;
    this.direction = config.direction;
    this.variant = config.variant ?? Math.floor(Math.random() * 4);

    // Start position based on direction
    if (this.direction === 'right') {
      this.x = -this.width * CELL_SIZE;
    } else {
      this.x = CANVAS_WIDTH;
    }
  }

  update(deltaTime: number): void {
    const movement = this.speed * (deltaTime / 16.67); // Normalize to ~60fps

    if (this.direction === 'right') {
      this.x += movement;
    } else {
      this.x -= movement;
    }
  }

  isOffscreen(): boolean {
    if (this.direction === 'right') {
      return this.x > CANVAS_WIDTH;
    } else {
      return this.x + this.width * CELL_SIZE < 0;
    }
  }

  getHitbox(): Rectangle {
    return {
      x: this.x,
      y: this.y * CELL_SIZE,
      width: this.width * CELL_SIZE,
      height: CELL_SIZE,
    };
  }

  getState(): MovingObjectState {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      width: this.width,
      speed: this.speed,
      direction: this.direction,
      variant: this.variant,
    };
  }

  getX(): number {
    return this.x;
  }

  getType(): ObjectType {
    return this.type;
  }
}
