'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/game/constants';
import { Game } from '@/game/Game';
import type { GameState } from '@/game/types';

interface GameCanvasProps {
  onStateChange?: (state: GameState) => void;
}

export function GameCanvas({ onStateChange }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  const handleStateChange = useCallback((state: GameState) => {
    setGameState(state);
    if (onStateChange) {
      onStateChange(state);
    }
  }, [onStateChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize game
    const game = new Game(canvas);
    game.onStateChange = handleStateChange;
    gameRef.current = game;

    // Start the game loop
    game.start();

    // Set initial state
    setGameState(game.getState());

    // Cleanup
    return () => {
      game.stop();
    };
  }, [handleStateChange]);

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-4 border-gray-800 rounded"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Title Screen Overlay */}
      {gameState?.status === 'title' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
          <h1 className="text-4xl font-bold text-green-400 mb-4">HOPPER</h1>
          <p className="text-gray-300 mb-2">Cross the road. Ride the logs.</p>
          <p className="text-gray-300 mb-6">Reach home.</p>
          {gameState.highScore > 0 && (
            <p className="text-yellow-400 mb-4">High Score: {gameState.highScore}</p>
          )}
          <p className="text-white animate-pulse">Press SPACE to start</p>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameState?.status === 'gameover' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
          <h2 className="text-3xl font-bold text-red-500 mb-4">GAME OVER</h2>
          <p className="text-white text-xl mb-2">Score: {gameState.score}</p>
          {gameState.score >= gameState.highScore && gameState.score > 0 && (
            <p className="text-yellow-400 mb-4">NEW HIGH SCORE!</p>
          )}
          <p className="text-gray-300 animate-pulse mt-4">Press SPACE to restart</p>
        </div>
      )}

      {/* Level Complete Overlay */}
      {gameState?.status === 'levelcomplete' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
          <h2 className="text-3xl font-bold text-green-400 mb-4">LEVEL {gameState.level - 1} COMPLETE!</h2>
          <p className="text-white text-xl">Score: {gameState.score}</p>
        </div>
      )}

      {/* HUD */}
      {gameState && gameState.status !== 'title' && (
        <div className="absolute top-0 left-0 right-0 bg-black/70 px-2 py-1 flex justify-between text-xs">
          <span className="text-white">Score: {gameState.score}</span>
          <span className="text-gray-400">HI: {gameState.highScore}</span>
          <span className="text-yellow-400">Lv{gameState.level}</span>
          <span className="text-white">
            {'🐸'.repeat(gameState.lives)}
          </span>
        </div>
      )}

      {/* Pause Overlay */}
      {gameState?.status === 'playing' && gameState.paused && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
          <h2 className="text-3xl font-bold text-yellow-400 mb-4">PAUSED</h2>
          <p className="text-gray-300">Press P to resume</p>
        </div>
      )}

      {/* Timer Bar */}
      {gameState && gameState.status === 'playing' && (
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-800">
          <div
            className="h-full bg-green-500 transition-all duration-100"
            style={{ width: `${(gameState.timeRemaining / gameState.maxTime) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
