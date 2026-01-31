// Hopper - Level Configuration Tests

import { getLevelConfig, getTimeLimitForLevel, scaleLaneConfigs, BASE_LANE_CONFIGS } from '../game/LevelConfig';
import { INITIAL_TIME } from '../game/constants';

describe('getLevelConfig', () => {
  it('returns base values for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.trafficSpeedMultiplier).toBe(1);
    expect(config.riverSpeedMultiplier).toBe(1);
    expect(config.spawnDensityMultiplier).toBe(1);
  });

  it('increases traffic speed by 15% per level', () => {
    const level2 = getLevelConfig(2);
    expect(level2.trafficSpeedMultiplier).toBeCloseTo(1.15);
    
    const level3 = getLevelConfig(3);
    expect(level3.trafficSpeedMultiplier).toBeCloseTo(1.30);
  });

  it('increases river speed by 10% per level', () => {
    const level2 = getLevelConfig(2);
    expect(level2.riverSpeedMultiplier).toBeCloseTo(1.10);
    
    const level3 = getLevelConfig(3);
    expect(level3.riverSpeedMultiplier).toBeCloseTo(1.20);
  });
});

describe('getTimeLimitForLevel', () => {
  it('returns 60 seconds for level 1', () => {
    expect(getTimeLimitForLevel(1)).toBe(INITIAL_TIME); // 60
  });

  it('decreases by 2 seconds per level', () => {
    expect(getTimeLimitForLevel(2)).toBe(58);
    expect(getTimeLimitForLevel(3)).toBe(56);
    expect(getTimeLimitForLevel(5)).toBe(52);
  });

  it('has minimum of 30 seconds', () => {
    expect(getTimeLimitForLevel(20)).toBe(30);
    expect(getTimeLimitForLevel(50)).toBe(30);
  });
});

describe('scaleLaneConfigs', () => {
  it('applies speed multipliers to lane configs', () => {
    const riverLane = [{ row: 1, type: 'river' as const, direction: 'right' as const, speed: 1.0, objectType: 'log' as const, spawnInterval: 100 }];
    const scaled = scaleLaneConfigs(riverLane, 2);
    expect(scaled[0].speed).toBeCloseTo(1.1); // 1.0 * 1.10
  });

  it('applies different multipliers for road vs river', () => {
    const roadLane = [{ row: 6, type: 'road' as const, direction: 'left' as const, speed: 2.0, objectType: 'car' as const, spawnInterval: 80 }];
    const scaled = scaleLaneConfigs(roadLane, 2);
    expect(scaled[0].speed).toBeCloseTo(2.3); // 2.0 * 1.15
  });

  it('reduces spawn interval with higher levels', () => {
    const lane = [{ row: 6, type: 'road' as const, direction: 'left' as const, speed: 2.0, objectType: 'car' as const, spawnInterval: 100 }];
    const scaled = scaleLaneConfigs(lane, 2);
    expect(scaled[0].spawnInterval).toBeLessThan(100);
  });

  it('enforces minimum spawn interval of 30', () => {
    const lane = [{ row: 6, type: 'road' as const, direction: 'left' as const, speed: 2.0, objectType: 'car' as const, spawnInterval: 40 }];
    const scaled = scaleLaneConfigs(lane, 10);
    expect(scaled[0].spawnInterval).toBeGreaterThanOrEqual(30);
  });
});

describe('BASE_LANE_CONFIGS', () => {
  it('has river lanes for rows 1-4', () => {
    const riverLanes = BASE_LANE_CONFIGS.filter(c => c.type === 'river');
    expect(riverLanes.length).toBe(4);
    expect(riverLanes.map(l => l.row).sort((a, b) => a - b)).toEqual([1, 2, 3, 4]);
  });

  it('has road lanes for rows 6-12', () => {
    const roadLanes = BASE_LANE_CONFIGS.filter(c => c.type === 'road');
    expect(roadLanes.length).toBe(7);
    expect(roadLanes.map(l => l.row).sort((a, b) => a - b)).toEqual([6, 7, 8, 9, 10, 11, 12]);
  });
});
