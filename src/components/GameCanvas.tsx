'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/game/constants';
import { Game } from '@/game/Game';
import type { GameState } from '@/game/types';
import type { ReplayData } from '@/game/Replay';
import { HUD } from './HUD';
import { TitleScreen } from './TitleScreen';
import { GameOverScreen } from './GameOverScreen';
import { LevelCompleteScreen } from './LevelCompleteScreen';
import { PauseScreen } from './PauseScreen';
import { ReplayView } from './ReplayView';
import { ReplayImport } from './ReplayImport';
import { Music } from '@/game/Music';

interface GameCanvasProps {
  onStateChange?: (state: GameState) => void;
}

export function GameCanvas({ onStateChange }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showReplayView, setShowReplayView] = useState(false);
  const [showReplayImport, setShowReplayImport] = useState(false);
  const [currentReplayData, setCurrentReplayData] = useState<ReplayData | null>(null);

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

  // Replay handlers
  const handleShowReplayView = useCallback(() => {
    const data = gameRef.current?.getLastReplayData();
    if (data) {
      setCurrentReplayData(data);
      setShowReplayView(true);
    }
  }, []);

  const handleCloseReplayView = useCallback(() => {
    setShowReplayView(false);
    setCurrentReplayData(null);
  }, []);

  const handleOpenReplayImport = useCallback(() => {
    setShowReplayImport(true);
  }, []);

  const handleCloseReplayImport = useCallback(() => {
    setShowReplayImport(false);
  }, []);

  const handleImportReplay = useCallback((data: ReplayData) => {
    setShowReplayImport(false);
    gameRef.current?.startPlayback(data);
  }, []);

  const handleWatchReplayFromView = useCallback(() => {
    if (currentReplayData) {
      setShowReplayView(false);
      gameRef.current?.startPlayback(currentReplayData);
    }
  }, [currentReplayData]);

  // Switch music tracks based on game state
  useEffect(() => {
    if (!gameState) return;
    
    switch (gameState.status) {
      case 'title':
        Music.play('menu');
        break;
      case 'playing':
        if (!gameState.paused) {
          Music.play('gameplay');
        }
        break;
      case 'levelcomplete':
        Music.play('victory');
        break;
      case 'gameover':
        Music.play('gameover');
        break;
    }
  }, [gameState?.status, gameState?.paused]);

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
        <TitleScreen
          highScore={gameState.highScore}
          onStartNormal={() => gameRef.current?.reset()}
          onStartDaily={() => gameRef.current?.startDaily()}
          onWatchReplay={handleOpenReplayImport}
        />
      )}

      {/* Game Over Screen */}
      {gameState?.status === 'gameover' && (
        <GameOverScreen
          score={gameState.score}
          isNewHighScore={isNewHighScore}
          dailyMode={gameRef.current?.isDailyMode() ?? false}
          hasReplay={gameRef.current?.getLastReplayData() !== null}
          onShareReplay={handleShowReplayView}
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

      {/* Replay playback progress bar */}
      {gameRef.current?.isPlaybackMode() && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            right: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              flex: 1,
              height: '8px',
              backgroundColor: '#333',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(gameRef.current?.getPlaybackProgress() ?? 0) * 100}%`,
                height: '100%',
                backgroundColor: '#3b82f6',
                transition: 'width 0.1s',
              }}
            />
          </div>
          <button
            onClick={() => gameRef.current?.stopPlayback()}
            style={{
              backgroundColor: '#ef4444',
              color: '#fff',
              border: 'none',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            STOP
          </button>
        </div>
      )}

      {/* Replay View Modal */}
      {showReplayView && currentReplayData && (
        <ReplayView
          data={currentReplayData}
          onClose={handleCloseReplayView}
          onWatch={handleWatchReplayFromView}
        />
      )}

      {/* Replay Import Modal */}
      {showReplayImport && (
        <ReplayImport
          onImport={handleImportReplay}
          onClose={handleCloseReplayImport}
        />
      )}
    </div>
  );
}
