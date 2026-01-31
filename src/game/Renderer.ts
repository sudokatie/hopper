// Hopper - Canvas Renderer

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  CELL_SIZE,
  COLORS,
  RIVER_ROWS,
  ROAD_ROWS,
  SAFE_ROWS,
  HOME_ROW,
} from './constants';
import type {
  PlayerState,
  LaneState,
  HomeState,
  MovingObjectState,
  GameStatus,
  Position,
} from './types';

export class Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  clear(): void {
    this.ctx.fillStyle = COLORS.grass;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  drawBackground(): void {
    // Draw water rows
    this.ctx.fillStyle = COLORS.water;
    for (const row of RIVER_ROWS) {
      this.ctx.fillRect(0, row * CELL_SIZE, CANVAS_WIDTH, CELL_SIZE);
    }

    // Draw road rows
    this.ctx.fillStyle = COLORS.road;
    for (const row of ROAD_ROWS) {
      this.ctx.fillRect(0, row * CELL_SIZE, CANVAS_WIDTH, CELL_SIZE);
    }

    // Draw road lane lines
    this.ctx.strokeStyle = COLORS.roadLine;
    this.ctx.setLineDash([10, 10]);
    this.ctx.lineWidth = 2;
    for (const row of ROAD_ROWS) {
      if (row === ROAD_ROWS[ROAD_ROWS.length - 1]) continue; // No line after last road row
      const y = (row + 1) * CELL_SIZE;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(CANVAS_WIDTH, y);
      this.ctx.stroke();
    }
    this.ctx.setLineDash([]);

    // Draw safe zones
    this.ctx.fillStyle = COLORS.safeZone;
    for (const row of SAFE_ROWS) {
      this.ctx.fillRect(0, row * CELL_SIZE, CANVAS_WIDTH, CELL_SIZE);
    }

    // Draw home row background
    this.ctx.fillStyle = COLORS.grass;
    this.ctx.fillRect(0, HOME_ROW * CELL_SIZE, CANVAS_WIDTH, CELL_SIZE);
  }

  drawHomes(homes: HomeState[]): void {
    for (const home of homes) {
      const x = home.column * CELL_SIZE;
      const y = HOME_ROW * CELL_SIZE;
      
      // Draw home slot
      this.ctx.fillStyle = home.filled ? COLORS.homeFilled : COLORS.homeSlot;
      this.ctx.fillRect(x + 4, y + 4, CELL_SIZE - 8, CELL_SIZE - 8);
      
      // Draw border
      this.ctx.strokeStyle = COLORS.home;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x + 4, y + 4, CELL_SIZE - 8, CELL_SIZE - 8);
    }
  }

  drawLanes(lanes: LaneState[]): void {
    for (const lane of lanes) {
      for (const obj of lane.objects) {
        this.drawMovingObject(obj);
      }
    }
  }

  drawMovingObject(obj: MovingObjectState): void {
    const x = obj.x;
    const y = obj.y * CELL_SIZE;
    const width = obj.width * CELL_SIZE;
    const height = CELL_SIZE;

    if (obj.type === 'log') {
      // Draw log
      this.ctx.fillStyle = COLORS.log;
      this.ctx.fillRect(x, y + 4, width, height - 8);
      
      // Draw log texture lines
      this.ctx.strokeStyle = '#6b3310';
      this.ctx.lineWidth = 2;
      for (let i = 0; i < obj.width; i++) {
        const lineX = x + (i + 0.5) * CELL_SIZE;
        this.ctx.beginPath();
        this.ctx.moveTo(lineX, y + 8);
        this.ctx.lineTo(lineX, y + height - 8);
        this.ctx.stroke();
      }
    } else if (obj.type === 'car') {
      // Draw car
      const color = COLORS.cars[obj.variant % COLORS.cars.length];
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x + 4, y + 8, width - 8, height - 16);
      
      // Draw wheels
      this.ctx.fillStyle = '#111';
      this.ctx.fillRect(x + 6, y + 4, 8, 6);
      this.ctx.fillRect(x + width - 14, y + 4, 8, 6);
      this.ctx.fillRect(x + 6, y + height - 10, 8, 6);
      this.ctx.fillRect(x + width - 14, y + height - 10, 8, 6);
    } else if (obj.type === 'truck') {
      // Draw truck
      const color = COLORS.trucks[obj.variant % COLORS.trucks.length];
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x + 4, y + 6, width - 8, height - 12);
      
      // Draw cab
      this.ctx.fillStyle = '#222';
      if (obj.direction === 'right') {
        this.ctx.fillRect(x + width - 20, y + 8, 16, height - 16);
      } else {
        this.ctx.fillRect(x + 4, y + 8, 16, height - 16);
      }
    }
  }

  drawPlayer(player: PlayerState, status: GameStatus): void {
    let x: number;
    let y: number;

    if (player.hopping && player.hopStart) {
      // Interpolate position during hop
      const targetX = player.position.x * CELL_SIZE;
      const targetY = player.position.y * CELL_SIZE;
      const startX = player.hopStart.x * CELL_SIZE;
      const startY = player.hopStart.y * CELL_SIZE;
      x = startX + (targetX - startX) * player.hopProgress;
      y = startY + (targetY - startY) * player.hopProgress;
    } else {
      x = player.position.x * CELL_SIZE;
      y = player.position.y * CELL_SIZE;
    }

    // Adjust for riding object
    if (player.ridingObject) {
      x = player.ridingObject.x + (player.position.x % 1) * CELL_SIZE;
    }

    // Draw frog
    const size = CELL_SIZE - 8;
    const offset = 4;

    if (status === 'dying') {
      // Death effect - flashing red
      const flash = Math.floor(Date.now() / 100) % 2 === 0;
      this.ctx.fillStyle = flash ? COLORS.frogDead : COLORS.frog;
    } else {
      this.ctx.fillStyle = player.alive ? COLORS.frog : COLORS.frogDead;
    }

    // Draw frog body (simple rectangle for MVP)
    this.ctx.fillRect(x + offset, y + offset, size, size);

    // Draw eyes
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(x + 8, y + 8, 8, 8);
    this.ctx.fillRect(x + CELL_SIZE - 16, y + 8, 8, 8);
    
    // Draw pupils
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(x + 10, y + 10, 4, 4);
    this.ctx.fillRect(x + CELL_SIZE - 14, y + 10, 4, 4);
  }

  drawDeathEffect(position: Position, progress: number): void {
    const x = position.x * CELL_SIZE + CELL_SIZE / 2;
    const y = position.y * CELL_SIZE + CELL_SIZE / 2;
    const radius = CELL_SIZE * progress;

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.strokeStyle = COLORS.frogDead;
    this.ctx.lineWidth = 3;
    this.ctx.globalAlpha = 1 - progress;
    this.ctx.stroke();
    this.ctx.globalAlpha = 1;
  }
}
