// Hopper - Pause Screen Component

'use client';

import { useState, useEffect } from 'react';
import { Music } from '../game/Music';
import { getSoundSystem } from '../game/Sound';

export function PauseScreen() {
  const sound = getSoundSystem();
  const [musicVolume, setMusicVolume] = useState(Music.getVolume());
  const [soundVolume, setSoundVolume] = useState(sound.getVolume());
  const [musicEnabled, setMusicEnabled] = useState(Music.isEnabled());
  const [soundEnabled, setSoundEnabled] = useState(sound.isEnabled());

  useEffect(() => {
    Music.setVolume(musicVolume);
  }, [musicVolume]);

  useEffect(() => {
    sound.setVolume(soundVolume);
  }, [soundVolume, sound]);

  const handleMusicToggle = () => {
    const newEnabled = !musicEnabled;
    setMusicEnabled(newEnabled);
    Music.setEnabled(newEnabled);
  };

  const handleSoundToggle = () => {
    const newEnabled = !soundEnabled;
    setSoundEnabled(newEnabled);
    sound.setEnabled(newEnabled);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
      <h2 className="text-3xl font-bold text-yellow-400 mb-4">PAUSED</h2>
      
      {/* Audio Controls */}
      <div className="bg-gray-800 p-4 rounded-lg mb-4 min-w-[280px]">
        <h3 className="text-sm font-bold text-gray-300 mb-3">Audio Settings</h3>
        
        {/* Music Volume */}
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={handleMusicToggle}
            className={`w-7 h-7 rounded flex items-center justify-center text-sm ${
              musicEnabled ? 'bg-green-600' : 'bg-gray-600'
            }`}
          >
            {musicEnabled ? '♪' : '✕'}
          </button>
          <span className="text-gray-300 w-14 text-sm">Music</span>
          <input
            type="range"
            min="0"
            max="100"
            value={musicVolume * 100}
            onChange={(e) => setMusicVolume(Number(e.target.value) / 100)}
            disabled={!musicEnabled}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <span className="text-gray-400 w-9 text-right text-sm">{Math.round(musicVolume * 100)}%</span>
        </div>
        
        {/* Sound Volume */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSoundToggle}
            className={`w-7 h-7 rounded flex items-center justify-center text-sm ${
              soundEnabled ? 'bg-green-600' : 'bg-gray-600'
            }`}
          >
            {soundEnabled ? '🔊' : '✕'}
          </button>
          <span className="text-gray-300 w-14 text-sm">Sound</span>
          <input
            type="range"
            min="0"
            max="100"
            value={soundVolume * 100}
            onChange={(e) => setSoundVolume(Number(e.target.value) / 100)}
            disabled={!soundEnabled}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <span className="text-gray-400 w-9 text-right text-sm">{Math.round(soundVolume * 100)}%</span>
        </div>
      </div>

      <p className="text-gray-300">Press P to resume</p>
    </div>
  );
}
