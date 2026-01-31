'use client';

import { useEffect, useRef, useState } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/game/constants';
import { GameLoop } from '@/game/GameLoop';
import { Renderer } from '@/game/Renderer';
import type { GameState } from '@/game/types';

interface GameCanvasProps {
  onStateChange?: (state: GameState) => void;
}

export function GameCanvas({ onStateChange }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<GameLoop | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize renderer
    rendererRef.current = new Renderer(ctx);

    // Placeholder game state for testing
    const testState: GameState = {
      player: {
        position: { x: 6, y: 13 },
        alive: true,
        ridingObject: null,
        hopping: false,
        hopProgress: 0,
        hopDirection: null,
        hopStart: null,
      },
      score: 0,
      highScore: 0,
      lives: 3,
      level: 1,
      timeRemaining: 60,
      maxTime: 60,
      lanes: [],
      homes: [
        { column: 1, filled: false },
        { column: 4, filled: true },
        { column: 7, filled: false },
        { column: 10, filled: false },
      ],
      status: 'playing',
    };

    // Game loop functions
    const update = (deltaTime: number) => {
      // Placeholder update - just passes state
      // deltaTime will be used for animations when we add them
      void deltaTime;
      if (onStateChange) {
        onStateChange(testState);
      }
    };

    const render = () => {
      const renderer = rendererRef.current;
      if (!renderer) return;

      renderer.clear();
      renderer.drawBackground();
      renderer.drawHomes(testState.homes);
      renderer.drawLanes(testState.lanes);
      renderer.drawPlayer(testState.player, testState.status);
    };

    // Initialize game loop
    gameLoopRef.current = new GameLoop(update, render);
    gameLoopRef.current.start();
    setReady(true);

    // Cleanup
    return () => {
      if (gameLoopRef.current) {
        gameLoopRef.current.stop();
      }
    };
  }, [onStateChange]);

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-4 border-gray-800 rounded"
        style={{ imageRendering: 'pixelated' }}
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="text-white text-xl">Loading...</span>
        </div>
      )}
    </div>
  );
}
