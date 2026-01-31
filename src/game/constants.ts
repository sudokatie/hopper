// Hopper - Game Constants

// Grid dimensions
export const GRID_COLS = 13;
export const GRID_ROWS = 14;
export const CELL_SIZE = 40;
export const CANVAS_WIDTH = GRID_COLS * CELL_SIZE; // 520
export const CANVAS_HEIGHT = GRID_ROWS * CELL_SIZE; // 560

// Player
export const PLAYER_START = { x: 6, y: 13 };
export const PLAYER_HITBOX_SCALE = 0.8; // 80% of cell size

// Homes (5 slots as per spec)
export const HOME_COLUMNS = [1, 4, 7, 10, 12];
export const HOME_ROW = 0;

// Timing (in milliseconds)
export const HOP_DURATION_MS = 100;
export const HOP_COOLDOWN_MS = 50;
export const DEATH_DURATION_MS = 500;
export const LEVEL_COMPLETE_DURATION_MS = 2000;

// Game rules
export const INITIAL_LIVES = 3;
export const INITIAL_TIME = 60; // seconds
export const EXTRA_LIFE_SCORE = 10000;

// Scoring
export const POINTS_HOP_FORWARD = 10;
export const POINTS_HOME = 50;
export const POINTS_ALL_HOMES = 1000;
export const POINTS_TIME_BONUS = 10; // per second remaining

// Object sizes (in cells)
export const CAR_WIDTH = 1;
export const TRUCK_WIDTH = 2;
export const SHORT_LOG_WIDTH = 2;
export const LONG_LOG_WIDTH = 4;

// Lane rows
export const SAFE_ROWS = [5, 13];
export const RIVER_ROWS = [1, 2, 3, 4];
export const ROAD_ROWS = [6, 7, 8, 9, 10, 11, 12];

// Colors
export const COLORS = {
  grass: '#2d5a27',
  road: '#333333',
  roadLine: '#ffff00',
  water: '#1a4c7c',
  log: '#8b4513',
  frog: '#32cd32',
  frogDead: '#ff0000',
  cars: ['#ff4444', '#4444ff', '#ffff44', '#44ff44'],
  trucks: ['#ff8800', '#8800ff'],
  home: '#4a9c4a',
  homeFilled: '#90ee90',
  homeSlot: '#1a3a1a',
  text: '#ffffff',
  textShadow: '#000000',
  hud: 'rgba(0, 0, 0, 0.7)',
  safeZone: '#3d6a37',
};

// Frame rate
export const TARGET_FPS = 60;
export const FRAME_TIME = 1000 / TARGET_FPS;

// Local storage keys
export const STORAGE_HIGH_SCORE = 'hopper_high_score';
