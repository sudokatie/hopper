// Hopper - Lane Management

import { MovingObject, MovingObjectConfig } from './MovingObject';
import { CAR_WIDTH, TRUCK_WIDTH, SHORT_LOG_WIDTH, LONG_LOG_WIDTH } from './constants';
import type { LaneType, ObjectType, LaneState, LaneConfig } from './types';

export class Lane {
  private row: number;
  private type: LaneType;
  private direction: 'left' | 'right';
  private speed: number;
  private objectType: ObjectType;
  private objectWidth: number;
  private spawnInterval: number;
  private framesSinceSpawn: number = 0;
  private objects: MovingObject[] = [];

  constructor(config: LaneConfig) {
    this.row = config.row;
    this.type = config.type;
    this.direction = config.direction ?? 'right';
    this.speed = config.speed ?? 1;
    this.objectType = config.objectType ?? 'car';
    this.spawnInterval = config.spawnInterval ?? 100;

    // Determine object width based on type
    this.objectWidth = config.objectWidth ?? this.getDefaultWidth();
  }

  private getDefaultWidth(): number {
    switch (this.objectType) {
      case 'car':
        return CAR_WIDTH;
      case 'truck':
        return TRUCK_WIDTH;
      case 'log':
        // Alternate between short and long logs
        return Math.random() > 0.5 ? SHORT_LOG_WIDTH : LONG_LOG_WIDTH;
      default:
        return 1;
    }
  }

  update(deltaTime: number): void {
    // Update existing objects
    for (const obj of this.objects) {
      obj.update(deltaTime);
    }

    // Remove offscreen objects
    this.objects = this.objects.filter(obj => !obj.isOffscreen());

    // Spawn new objects
    this.framesSinceSpawn += deltaTime / 16.67;
    if (this.framesSinceSpawn >= this.spawnInterval) {
      this.spawnObject();
      this.framesSinceSpawn = 0;
    }
  }

  spawnObject(): void {
    // Determine width (random for logs)
    const width = this.objectType === 'log'
      ? (Math.random() > 0.5 ? SHORT_LOG_WIDTH : LONG_LOG_WIDTH)
      : this.objectWidth;

    const config: MovingObjectConfig = {
      type: this.objectType,
      y: this.row,
      width,
      speed: this.speed,
      direction: this.direction,
    };

    this.objects.push(new MovingObject(config));
  }

  getObjects(): MovingObject[] {
    return this.objects;
  }

  getRow(): number {
    return this.row;
  }

  getType(): LaneType {
    return this.type;
  }

  getState(): LaneState {
    return {
      row: this.row,
      type: this.type,
      direction: this.direction,
      speed: this.speed,
      objects: this.objects.map(o => o.getState()),
      objectType: this.objectType,
      objectWidth: this.objectWidth,
      spawnInterval: this.spawnInterval,
      framesSinceSpawn: this.framesSinceSpawn,
    };
  }
}

// Base lane configurations
const baseLaneConfigs: LaneConfig[] = [
  // River lanes (rows 1-4)
  { row: 1, type: 'river', direction: 'right', speed: 1.2, objectType: 'log', spawnInterval: 150 },
  { row: 2, type: 'river', direction: 'left', speed: 1.0, objectType: 'log', spawnInterval: 180 },
  { row: 3, type: 'river', direction: 'right', speed: 1.5, objectType: 'log', spawnInterval: 120 },
  { row: 4, type: 'river', direction: 'left', speed: 0.8, objectType: 'log', spawnInterval: 200 },

  // Road lanes (rows 6-12)
  { row: 6, type: 'road', direction: 'left', speed: 2.0, objectType: 'car', spawnInterval: 80 },
  { row: 7, type: 'road', direction: 'right', speed: 1.5, objectType: 'truck', spawnInterval: 150 },
  { row: 8, type: 'road', direction: 'left', speed: 2.5, objectType: 'car', spawnInterval: 70 },
  { row: 9, type: 'road', direction: 'right', speed: 1.8, objectType: 'car', spawnInterval: 90 },
  { row: 10, type: 'road', direction: 'left', speed: 2.2, objectType: 'car', spawnInterval: 75 },
  { row: 11, type: 'road', direction: 'right', speed: 1.2, objectType: 'truck', spawnInterval: 180 },
  { row: 12, type: 'road', direction: 'left', speed: 2.8, objectType: 'car', spawnInterval: 60 },
];

// Create lanes for a specific level with difficulty scaling
export function createLanesForLevel(level: number): Lane[] {
  // Difficulty multiplier: 10% faster and more frequent per level
  const speedMultiplier = 1 + (level - 1) * 0.1;
  const spawnMultiplier = 1 - (level - 1) * 0.05; // Lower = more frequent
  const minSpawnInterval = 30; // Don't go below this

  const scaledConfigs = baseLaneConfigs.map(config => ({
    ...config,
    speed: (config.speed ?? 1) * speedMultiplier,
    spawnInterval: Math.max(minSpawnInterval, Math.floor((config.spawnInterval ?? 100) * spawnMultiplier)),
  }));

  return scaledConfigs.map(config => new Lane(config));
}

// Default lane configurations for level 1
export function createDefaultLanes(): Lane[] {
  return createLanesForLevel(1);
}
