// Hopper - Game Types

export interface Position {
  x: number;
  y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export type LaneType = 'safe' | 'road' | 'river' | 'home';

export type ObjectType = 'car' | 'truck' | 'log';

export type GameStatus = 'title' | 'playing' | 'dying' | 'gameover' | 'levelcomplete';

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlayerState {
  position: Position;
  alive: boolean;
  ridingObject: MovingObjectState | null;
  hopping: boolean;
  hopProgress: number;
  hopDirection: Direction | null;
  hopStart: Position | null;
}

export interface MovingObjectState {
  type: ObjectType;
  x: number;
  y: number;
  width: number;
  speed: number;
  direction: 'left' | 'right';
  variant: number;
}

export interface LaneConfig {
  row: number;
  type: LaneType;
  direction?: 'left' | 'right';
  speed?: number;
  objectType?: ObjectType;
  objectWidth?: number;
  spawnInterval?: number;
}

export interface LaneState {
  row: number;
  type: LaneType;
  direction: 'left' | 'right';
  speed: number;
  objects: MovingObjectState[];
  objectType: ObjectType;
  objectWidth: number;
  spawnInterval: number;
  framesSinceSpawn: number;
}

export interface HomeState {
  column: number;
  filled: boolean;
}

export interface GameState {
  player: PlayerState;
  score: number;
  highScore: number;
  lives: number;
  level: number;
  timeRemaining: number;
  maxTime: number;
  lanes: LaneState[];
  homes: HomeState[];
  status: GameStatus;
  paused: boolean;
}

export interface LevelConfig {
  trafficSpeedMultiplier: number;
  riverSpeedMultiplier: number;
  spawnDensityMultiplier: number;
  timeLimit: number;
}
