// Sound.ts - Synthesized retro sound effects using Web Audio API

export type SoundEffect = 'hop' | 'splash' | 'splat' | 'home' | 'levelUp' | 'gameOver';

interface SoundConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  decay?: boolean;
  sweep?: number; // frequency sweep (positive = up, negative = down)
}

const SOUND_CONFIGS: Record<SoundEffect, SoundConfig> = {
  hop: { frequency: 300, duration: 0.08, type: 'square', sweep: 200 },
  splash: { frequency: 200, duration: 0.3, type: 'sawtooth', decay: true, sweep: -150 },
  splat: { frequency: 100, duration: 0.15, type: 'sawtooth', decay: true },
  home: { frequency: 523, duration: 0.15, type: 'sine', sweep: 200 },
  levelUp: { frequency: 440, duration: 0.4, type: 'square', sweep: 440 },
  gameOver: { frequency: 200, duration: 0.5, type: 'sawtooth', decay: true, sweep: -100 },
};

export interface SoundSystem {
  play: (effect: SoundEffect) => void;
  setEnabled: (enabled: boolean) => void;
  isEnabled: () => boolean;
  setVolume: (volume: number) => void;
  getVolume: () => number;
}

export function createSoundSystem(): SoundSystem {
  let audioContext: AudioContext | null = null;
  let enabled = true;
  let volume = 0.3;

  function getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!audioContext) {
      try {
        audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch {
        return null;
      }
    }
    return audioContext;
  }

  function play(effect: SoundEffect): void {
    if (!enabled) return;
    const ctx = getContext();
    if (!ctx) return;

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const config = SOUND_CONFIGS[effect];
    if (!config) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime);

    // Apply frequency sweep if configured
    if (config.sweep) {
      oscillator.frequency.linearRampToValueAtTime(
        config.frequency + config.sweep,
        ctx.currentTime + config.duration
      );
    }

    // Set initial gain
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);

    // Apply decay envelope if configured
    if (config.decay) {
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration);
    } else {
      // Quick fade out to avoid clicks
      gainNode.gain.setValueAtTime(volume, ctx.currentTime + config.duration - 0.02);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + config.duration);
    }

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + config.duration);
  }

  function setEnabled(value: boolean): void {
    enabled = value;
  }

  function isEnabled(): boolean {
    return enabled;
  }

  function setVolume(value: number): void {
    volume = Math.max(0, Math.min(1, value));
  }

  function getVolume(): number {
    return volume;
  }

  return {
    play,
    setEnabled,
    isEnabled,
    setVolume,
    getVolume,
  };
}

// Singleton for easy access across game
let globalSoundSystem: SoundSystem | null = null;

export function getSoundSystem(): SoundSystem {
  if (!globalSoundSystem) {
    globalSoundSystem = createSoundSystem();
  }
  return globalSoundSystem;
}

// Convenience function
export function playSound(effect: SoundEffect): void {
  getSoundSystem().play(effect);
}
