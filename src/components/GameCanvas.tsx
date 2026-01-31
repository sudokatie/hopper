'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/game/constants';
import { Game } from '@/game/Game';
import type { GameState } from '@/game/types';
import { HUD } from './HUD';
import { TitleScreen } from './TitleScreen';
import { GameOverScreen } from './GameOverScreen';
import { LevelCompleteScreen } from './LevelCompleteScreen';
import { PauseScreen } from './PauseScreen';

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

  const showHUD = gameState && gameState.status !== 'title';
  const isNewHighScore = gameState ? gameState.score >= gameState.highScore && gameState.score > 0 : false;

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-4 border-gray-800 rounded"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Title Screen */}
      {gameState?.status === 'title' && (
        <TitleScreen highScore={gameState.highScore} />
      )}

      {/* Game Over Screen */}
      {gameState?.status === 'gameover' && (
        <GameOverScreen
          score={gameState.score}
          isNewHighScore={isNewHighScore}
        />
      )}

      {/* Level Complete Screen */}
      {gameState?.status === 'levelcomplete' && (
        <LevelCompleteScreen
          level={gameState.level - 1}
          score={gameState.score}
        />
      )}

      {/* HUD */}
      {showHUD && (
        <HUD
          score={gameState.score}
          highScore={gameState.highScore}
          level={gameState.level}
          lives={gameState.lives}
          timeRemaining={gameState.timeRemaining}
          maxTime={gameState.maxTime}
        />
      )}

      {/* Pause Screen */}
      {gameState?.status === 'playing' && gameState.paused && (
        <PauseScreen />
      )}
    </div>
  );
}
