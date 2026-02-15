// Sound.test.ts - Tests for synthesized sound effects

import { createSoundSystem, type SoundSystem, type SoundEffect } from '../game/Sound';

describe('SoundSystem', () => {
  let sound: SoundSystem;

  beforeEach(() => {
    sound = createSoundSystem();
  });

  describe('createSoundSystem', () => {
    it('creates a sound system with default settings', () => {
      expect(sound).toBeDefined();
      expect(sound.isEnabled()).toBe(true);
      expect(sound.getVolume()).toBe(0.3);
    });
  });

  describe('setEnabled / isEnabled', () => {
    it('enables and disables sound', () => {
      expect(sound.isEnabled()).toBe(true);
      
      sound.setEnabled(false);
      expect(sound.isEnabled()).toBe(false);
      
      sound.setEnabled(true);
      expect(sound.isEnabled()).toBe(true);
    });
  });

  describe('setVolume / getVolume', () => {
    it('sets and gets volume', () => {
      sound.setVolume(0.5);
      expect(sound.getVolume()).toBe(0.5);
      
      sound.setVolume(1.0);
      expect(sound.getVolume()).toBe(1.0);
      
      sound.setVolume(0.0);
      expect(sound.getVolume()).toBe(0.0);
    });

    it('clamps volume to 0-1 range', () => {
      sound.setVolume(-0.5);
      expect(sound.getVolume()).toBe(0);
      
      sound.setVolume(1.5);
      expect(sound.getVolume()).toBe(1);
    });
  });

  describe('play', () => {
    // Note: We can't fully test audio playback in Jest (no Web Audio API)
    // but we can test that play doesn't throw when disabled
    
    it('does not throw when sound is disabled', () => {
      sound.setEnabled(false);
      expect(() => sound.play('hop')).not.toThrow();
      expect(() => sound.play('splash')).not.toThrow();
      expect(() => sound.play('splat')).not.toThrow();
      expect(() => sound.play('home')).not.toThrow();
      expect(() => sound.play('levelUp')).not.toThrow();
      expect(() => sound.play('gameOver')).not.toThrow();
    });

    it('does not throw for any sound effect type', () => {
      const effects: SoundEffect[] = ['hop', 'splash', 'splat', 'home', 'levelUp', 'gameOver'];
      for (const effect of effects) {
        expect(() => sound.play(effect)).not.toThrow();
      }
    });
  });
});

describe('Sound effect types', () => {
  it('has all expected sound effects defined', () => {
    const effects: SoundEffect[] = ['hop', 'splash', 'splat', 'home', 'levelUp', 'gameOver'];
    // This is a compile-time check - if any effect is missing from the type, TS will error
    expect(effects).toHaveLength(6);
  });
});
