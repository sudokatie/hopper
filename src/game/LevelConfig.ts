// Hopper - Level Configuration

import { INITIAL_TIME } from './constants';
import type { LevelConfig, LaneConfig } from './types';

/**
 * Get difficulty configuration for a specific level
 */
export function getLevelConfig(level: number): LevelConfig {
  return {
    trafficSpeedMultiplier: 1 + (level - 1) * 0.15,  // +15% per level
    riverSpeedMultiplier: 1 + (level - 1) * 0.1,     // +10% per level
    spawnDensityMultiplier: 1 - (level - 1) * 0.05,  // Lower = more frequent
    timeLimit: getTimeLimitForLevel(level),
  };
}

/**
 * Calculate time limit for a level
 * -2 seconds per level, minimum 30 seconds
 */
export function getTimeLimitForLevel(level: number): number {
  return Math.max(30, INITIAL_TIME - (level - 1) * 2);
}

/**
 * Base lane configurations (level 1 values)
 */
export const BASE_LANE_CONFIGS: LaneConfig[] = [
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

/**
 * Apply level difficulty scaling to lane configs
 */
export function scaleLaneConfigs(configs: LaneConfig[], level: number): LaneConfig[] {
  const levelConfig = getLevelConfig(level);
  const minSpawnInterval = 30;

  return configs.map(config => {
    const isRiver = config.type === 'river';
    const speedMult = isRiver 
      ? levelConfig.riverSpeedMultiplier 
      : levelConfig.trafficSpeedMultiplier;
    
    return {
      ...config,
      speed: (config.speed ?? 1) * speedMult,
      spawnInterval: Math.max(
        minSpawnInterval,
        Math.floor((config.spawnInterval ?? 100) * levelConfig.spawnDensityMultiplier)
      ),
    };
  });
}

/**
 * Get scaled lane configs for a specific level
 */
export function getLaneConfigsForLevel(level: number): LaneConfig[] {
  return scaleLaneConfigs(BASE_LANE_CONFIGS, level);
}
