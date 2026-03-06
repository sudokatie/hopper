import type { Direction } from './types';

/**
 * A single recorded input with timestamp
 */
export interface ReplayFrame {
  time: number;  // ms since replay start
  direction: Direction;
}

/**
 * Complete replay data for a game session
 */
export interface ReplayData {
  version: number;
  level: number;       // Starting level
  timestamp: number;   // Unix timestamp when recorded
  duration: number;    // Total replay duration in ms
  frames: ReplayFrame[];
  finalScore: number;
  finalLevel: number;
  homes: number;       // Homes filled
  dailyMode: boolean;
}

/**
 * Encodes a direction to a single character
 */
function encodeDirection(dir: Direction): string {
  switch (dir) {
    case 'up': return 'u';
    case 'down': return 'd';
    case 'left': return 'l';
    case 'right': return 'r';
  }
}

/**
 * Decodes a single character back to Direction
 */
function decodeDirection(char: string): Direction | null {
  switch (char) {
    case 'u': return 'up';
    case 'd': return 'down';
    case 'l': return 'left';
    case 'r': return 'right';
    default: return null;
  }
}

/**
 * Replay recorder and player for Hopper
 */
export class Replay {
  private _frames: ReplayFrame[] = [];
  private _startTime: number = 0;
  private _isRecording: boolean = false;
  private _isPlaying: boolean = false;
  private _playbackIndex: number = 0;
  private _playbackStartTime: number = 0;
  private _level: number = 1;
  private _dailyMode: boolean = false;

  /**
   * Start recording inputs
   */
  startRecording(level: number = 1, dailyMode: boolean = false): void {
    this._frames = [];
    this._startTime = Date.now();
    this._isRecording = true;
    this._isPlaying = false;
    this._level = level;
    this._dailyMode = dailyMode;
  }

  /**
   * Record a direction input with current timestamp
   */
  recordInput(direction: Direction): void {
    if (!this._isRecording) return;
    
    this._frames.push({
      time: Date.now() - this._startTime,
      direction,
    });
  }

  /**
   * Stop recording and return the replay data
   */
  stopRecording(finalScore: number, finalLevel: number, homes: number): ReplayData {
    this._isRecording = false;
    
    return {
      version: 1,
      level: this._level,
      timestamp: this._startTime,
      duration: Date.now() - this._startTime,
      frames: [...this._frames],
      finalScore,
      finalLevel,
      homes,
      dailyMode: this._dailyMode,
    };
  }

  /**
   * Check if currently recording
   */
  get isRecording(): boolean {
    return this._isRecording;
  }

  /**
   * Start playback of a replay
   */
  startPlayback(data: ReplayData): void {
    this._frames = [...data.frames];
    this._playbackIndex = 0;
    this._playbackStartTime = Date.now();
    this._isPlaying = true;
    this._isRecording = false;
    this._level = data.level;
    this._dailyMode = data.dailyMode;
  }

  /**
   * Get next direction if its time has come
   * Returns null if no action ready or playback complete
   */
  getNextAction(): Direction | null {
    if (!this._isPlaying || this._playbackIndex >= this._frames.length) {
      return null;
    }

    const elapsed = Date.now() - this._playbackStartTime;
    const frame = this._frames[this._playbackIndex];

    if (elapsed >= frame.time) {
      this._playbackIndex++;
      return frame.direction;
    }

    return null;
  }

  /**
   * Check if playback is complete
   */
  get isPlaybackComplete(): boolean {
    return this._isPlaying && this._playbackIndex >= this._frames.length;
  }

  /**
   * Check if currently playing back
   */
  get isPlaying(): boolean {
    return this._isPlaying;
  }

  /**
   * Stop playback
   */
  stopPlayback(): void {
    this._isPlaying = false;
    this._playbackIndex = 0;
  }

  /**
   * Get playback progress (0-1)
   */
  get playbackProgress(): number {
    if (!this._isPlaying || this._frames.length === 0) return 0;
    return this._playbackIndex / this._frames.length;
  }

  /**
   * Get starting level for current replay
   */
  get level(): number {
    return this._level;
  }

  /**
   * Get daily mode flag for current replay
   */
  get dailyMode(): boolean {
    return this._dailyMode;
  }

  /**
   * Encode replay data to a shareable string
   * Format: version|level|timestamp|duration|score|finalLevel|homes|daily|frames
   * Frames: time,dir;time,dir;...
   */
  static encode(data: ReplayData): string {
    const framesStr = data.frames
      .map(f => `${f.time},${encodeDirection(f.direction)}`)
      .join(';');
    
    const parts = [
      data.version,
      data.level,
      data.timestamp,
      data.duration,
      data.finalScore,
      data.finalLevel,
      data.homes,
      data.dailyMode ? 1 : 0,
      framesStr,
    ];
    
    return btoa(parts.join('|'));
  }

  /**
   * Decode a replay string back to ReplayData
   */
  static decode(encoded: string): ReplayData | null {
    try {
      const decoded = atob(encoded);
      const parts = decoded.split('|');
      
      if (parts.length < 9) return null;
      
      const [version, level, timestamp, duration, score, finalLevel, homes, daily, framesStr] = parts;
      
      const frames: ReplayFrame[] = framesStr
        .split(';')
        .filter(f => f.length > 0)
        .map(f => {
          const [time, dirChar] = f.split(',');
          const direction = decodeDirection(dirChar);
          if (!direction) return null;
          return { time: parseInt(time, 10), direction };
        })
        .filter((f): f is ReplayFrame => f !== null);
      
      return {
        version: parseInt(version, 10),
        level: parseInt(level, 10),
        timestamp: parseInt(timestamp, 10),
        duration: parseInt(duration, 10),
        frames,
        finalScore: parseInt(score, 10),
        finalLevel: parseInt(finalLevel, 10),
        homes: parseInt(homes, 10),
        dailyMode: daily === '1',
      };
    } catch {
      return null;
    }
  }

  /**
   * Get replay statistics
   */
  static getStats(data: ReplayData): {
    totalHops: number;
    hopsPerSecond: number;
    upCount: number;
    downCount: number;
    leftCount: number;
    rightCount: number;
    durationSeconds: number;
  } {
    let upCount = 0;
    let downCount = 0;
    let leftCount = 0;
    let rightCount = 0;
    
    for (const frame of data.frames) {
      switch (frame.direction) {
        case 'up': upCount++; break;
        case 'down': downCount++; break;
        case 'left': leftCount++; break;
        case 'right': rightCount++; break;
      }
    }
    
    const durationSec = data.duration / 1000;
    
    return {
      totalHops: data.frames.length,
      hopsPerSecond: durationSec > 0 ? data.frames.length / durationSec : 0,
      upCount,
      downCount,
      leftCount,
      rightCount,
      durationSeconds: durationSec,
    };
  }

  /**
   * Generate share code for a replay
   */
  static generateShareCode(data: ReplayData): string {
    const dateStr = new Date(data.timestamp).toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = data.dailyMode ? 'HOPPER-D' : 'HOPPER';
    return `${prefix}-${dateStr}-${data.finalScore}-L${data.finalLevel}`;
  }
}
