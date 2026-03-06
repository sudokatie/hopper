import { Replay, ReplayData } from '../game/Replay';

describe('Replay', () => {
  describe('recording', () => {
    it('should start recording', () => {
      const replay = new Replay();
      replay.startRecording(1, false);
      expect(replay.isRecording).toBe(true);
      expect(replay.isPlaying).toBe(false);
    });

    it('should record inputs with timestamps', () => {
      const replay = new Replay();
      replay.startRecording(1, false);
      
      replay.recordInput('up');
      replay.recordInput('right');
      replay.recordInput('up');
      
      const data = replay.stopRecording(100, 1, 0);
      expect(data.frames.length).toBe(3);
      expect(data.frames[0].direction).toBe('up');
      expect(data.frames[1].direction).toBe('right');
      expect(data.frames[2].direction).toBe('up');
    });

    it('should stop recording and return data', () => {
      const replay = new Replay();
      replay.startRecording(1, false);
      replay.recordInput('up');
      
      const data = replay.stopRecording(500, 2, 3);
      
      expect(replay.isRecording).toBe(false);
      expect(data.version).toBe(1);
      expect(data.level).toBe(1);
      expect(data.finalScore).toBe(500);
      expect(data.finalLevel).toBe(2);
      expect(data.homes).toBe(3);
      expect(data.dailyMode).toBe(false);
    });

    it('should record daily mode flag', () => {
      const replay = new Replay();
      replay.startRecording(1, true);
      
      const data = replay.stopRecording(100, 1, 0);
      expect(data.dailyMode).toBe(true);
    });

    it('should not record when not recording', () => {
      const replay = new Replay();
      // Not started recording
      replay.recordInput('up');
      
      replay.startRecording(1, false);
      replay.recordInput('right');
      replay.stopRecording(0, 1, 0);
      
      // Recording stopped
      replay.recordInput('down');
      
      // Only 'right' should be recorded
      replay.startRecording(1, false);
      const data = replay.stopRecording(0, 1, 0);
      expect(data.frames.length).toBe(0);
    });
  });

  describe('playback', () => {
    it('should start playback', () => {
      const replay = new Replay();
      const data: ReplayData = {
        version: 1,
        level: 1,
        timestamp: Date.now(),
        duration: 1000,
        frames: [
          { time: 0, direction: 'up' },
          { time: 100, direction: 'right' },
        ],
        finalScore: 100,
        finalLevel: 1,
        homes: 0,
        dailyMode: false,
      };
      
      replay.startPlayback(data);
      expect(replay.isPlaying).toBe(true);
      expect(replay.isRecording).toBe(false);
    });

    it('should return actions at correct times', async () => {
      const replay = new Replay();
      const data: ReplayData = {
        version: 1,
        level: 1,
        timestamp: Date.now(),
        duration: 200,
        frames: [
          { time: 0, direction: 'up' },
          { time: 50, direction: 'right' },
          { time: 100, direction: 'down' },
        ],
        finalScore: 100,
        finalLevel: 1,
        homes: 0,
        dailyMode: false,
      };
      
      replay.startPlayback(data);
      
      // First frame should be available immediately
      const first = replay.getNextAction();
      expect(first).toBe('up');
      
      // Wait a bit for the second frame
      await new Promise(r => setTimeout(r, 60));
      const second = replay.getNextAction();
      expect(second).toBe('right');
    });

    it('should track playback progress', () => {
      const replay = new Replay();
      const data: ReplayData = {
        version: 1,
        level: 1,
        timestamp: Date.now(),
        duration: 100,
        frames: [
          { time: 0, direction: 'up' },
          { time: 10, direction: 'right' },
        ],
        finalScore: 100,
        finalLevel: 1,
        homes: 0,
        dailyMode: false,
      };
      
      replay.startPlayback(data);
      expect(replay.playbackProgress).toBe(0);
      
      // Get first frame
      replay.getNextAction();
      expect(replay.playbackProgress).toBe(0.5);
    });

    it('should report playback complete', async () => {
      const replay = new Replay();
      const data: ReplayData = {
        version: 1,
        level: 1,
        timestamp: Date.now(),
        duration: 50,
        frames: [
          { time: 0, direction: 'up' },
        ],
        finalScore: 100,
        finalLevel: 1,
        homes: 0,
        dailyMode: false,
      };
      
      replay.startPlayback(data);
      expect(replay.isPlaybackComplete).toBe(false);
      
      replay.getNextAction();
      expect(replay.isPlaybackComplete).toBe(true);
    });

    it('should stop playback', () => {
      const replay = new Replay();
      const data: ReplayData = {
        version: 1,
        level: 1,
        timestamp: Date.now(),
        duration: 100,
        frames: [{ time: 0, direction: 'up' }],
        finalScore: 100,
        finalLevel: 1,
        homes: 0,
        dailyMode: false,
      };
      
      replay.startPlayback(data);
      replay.stopPlayback();
      
      expect(replay.isPlaying).toBe(false);
    });
  });

  describe('encode/decode', () => {
    it('should encode replay data to string', () => {
      const data: ReplayData = {
        version: 1,
        level: 1,
        timestamp: 1709740800000,
        duration: 1000,
        frames: [
          { time: 0, direction: 'up' },
          { time: 100, direction: 'right' },
        ],
        finalScore: 500,
        finalLevel: 2,
        homes: 5,
        dailyMode: false,
      };
      
      const encoded = Replay.encode(data);
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });

    it('should decode replay string back to data', () => {
      const original: ReplayData = {
        version: 1,
        level: 1,
        timestamp: 1709740800000,
        duration: 1000,
        frames: [
          { time: 0, direction: 'up' },
          { time: 100, direction: 'right' },
          { time: 200, direction: 'down' },
          { time: 300, direction: 'left' },
        ],
        finalScore: 500,
        finalLevel: 2,
        homes: 5,
        dailyMode: false,
      };
      
      const encoded = Replay.encode(original);
      const decoded = Replay.decode(encoded);
      
      expect(decoded).not.toBeNull();
      expect(decoded!.version).toBe(original.version);
      expect(decoded!.level).toBe(original.level);
      expect(decoded!.timestamp).toBe(original.timestamp);
      expect(decoded!.duration).toBe(original.duration);
      expect(decoded!.finalScore).toBe(original.finalScore);
      expect(decoded!.finalLevel).toBe(original.finalLevel);
      expect(decoded!.homes).toBe(original.homes);
      expect(decoded!.dailyMode).toBe(original.dailyMode);
      expect(decoded!.frames.length).toBe(original.frames.length);
      expect(decoded!.frames[0].direction).toBe('up');
      expect(decoded!.frames[1].direction).toBe('right');
      expect(decoded!.frames[2].direction).toBe('down');
      expect(decoded!.frames[3].direction).toBe('left');
    });

    it('should handle empty frames', () => {
      const data: ReplayData = {
        version: 1,
        level: 1,
        timestamp: 1709740800000,
        duration: 0,
        frames: [],
        finalScore: 0,
        finalLevel: 1,
        homes: 0,
        dailyMode: false,
      };
      
      const encoded = Replay.encode(data);
      const decoded = Replay.decode(encoded);
      
      expect(decoded).not.toBeNull();
      expect(decoded!.frames.length).toBe(0);
    });

    it('should handle daily mode flag', () => {
      const data: ReplayData = {
        version: 1,
        level: 1,
        timestamp: 1709740800000,
        duration: 100,
        frames: [{ time: 0, direction: 'up' }],
        finalScore: 100,
        finalLevel: 1,
        homes: 1,
        dailyMode: true,
      };
      
      const encoded = Replay.encode(data);
      const decoded = Replay.decode(encoded);
      
      expect(decoded!.dailyMode).toBe(true);
    });

    it('should return null for invalid encoded string', () => {
      expect(Replay.decode('invalid')).toBeNull();
      expect(Replay.decode('')).toBeNull();
      expect(Replay.decode('!!!')).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should calculate replay statistics', () => {
      const data: ReplayData = {
        version: 1,
        level: 1,
        timestamp: Date.now(),
        duration: 2000, // 2 seconds
        frames: [
          { time: 0, direction: 'up' },
          { time: 100, direction: 'up' },
          { time: 200, direction: 'right' },
          { time: 300, direction: 'left' },
          { time: 400, direction: 'down' },
        ],
        finalScore: 100,
        finalLevel: 1,
        homes: 0,
        dailyMode: false,
      };
      
      const stats = Replay.getStats(data);
      
      expect(stats.totalHops).toBe(5);
      expect(stats.hopsPerSecond).toBe(2.5);
      expect(stats.upCount).toBe(2);
      expect(stats.downCount).toBe(1);
      expect(stats.leftCount).toBe(1);
      expect(stats.rightCount).toBe(1);
      expect(stats.durationSeconds).toBe(2);
    });

    it('should handle zero duration', () => {
      const data: ReplayData = {
        version: 1,
        level: 1,
        timestamp: Date.now(),
        duration: 0,
        frames: [],
        finalScore: 0,
        finalLevel: 1,
        homes: 0,
        dailyMode: false,
      };
      
      const stats = Replay.getStats(data);
      
      expect(stats.totalHops).toBe(0);
      expect(stats.hopsPerSecond).toBe(0);
    });
  });

  describe('generateShareCode', () => {
    it('should generate share code for regular replay', () => {
      const data: ReplayData = {
        version: 1,
        level: 1,
        timestamp: new Date('2026-03-06').getTime(),
        duration: 1000,
        frames: [],
        finalScore: 5000,
        finalLevel: 5,
        homes: 10,
        dailyMode: false,
      };
      
      const code = Replay.generateShareCode(data);
      expect(code).toMatch(/^HOPPER-\d{8}-5000-L5$/);
    });

    it('should generate share code for daily replay', () => {
      const data: ReplayData = {
        version: 1,
        level: 1,
        timestamp: new Date('2026-03-06').getTime(),
        duration: 1000,
        frames: [],
        finalScore: 3000,
        finalLevel: 3,
        homes: 6,
        dailyMode: true,
      };
      
      const code = Replay.generateShareCode(data);
      expect(code).toMatch(/^HOPPER-D-\d{8}-3000-L3$/);
    });
  });
});
