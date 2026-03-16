// Hopper - Title Screen Component

import { todayString } from '@/game/Daily';

interface TitleScreenProps {
  highScore: number;
  onStartNormal: () => void;
  onStartDaily: () => void;
  onWatchReplay?: () => void;
}

export function TitleScreen({ highScore, onStartNormal, onStartDaily, onWatchReplay }: TitleScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]">
      {/* Header */}
      <div className="w-full max-w-sm mb-4 px-4">
        <div className="flex items-center justify-between">
          <a href="/games/" className="mc-link">&lt; BACK TO HUB</a>
          <span className="mc-header">MISSION SELECT</span>
        </div>
      </div>

      {/* Main Panel */}
      <div className="mc-panel p-6 w-full max-w-sm mx-4">
        {/* Title Bar */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#2a2a2a]">
          <div className="mc-dot" />
          <h1 className="mc-header-primary text-2xl tracking-wider">HOPPER</h1>
        </div>

        {/* Description */}
        <p className="text-[#555555] text-xs text-center tracking-wider mb-4">
          CROSS THE ROAD. RIDE THE LOGS. REACH HOME.
        </p>

        {highScore > 0 && (
          <div className="text-center mb-4 p-3 bg-[#0d0d0d] border border-[#2a2a2a]">
            <span className="mc-header block mb-1">HIGH SCORE</span>
            <span className="text-[#dc2626] font-mono text-2xl">{highScore}</span>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onStartNormal}
            className="w-full py-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm tracking-widest font-medium transition-colors border border-[#dc2626]"
          >
            START MISSION
          </button>
          <div className="pt-3 border-t border-[#2a2a2a]">
            <button
              onClick={onStartDaily}
              className="w-full py-3 bg-transparent border border-[#2a2a2a] text-white text-sm tracking-widest font-medium transition-colors hover:border-[#dc2626]"
            >
              DAILY CHALLENGE
            </button>
            <p className="text-[#555555] text-xs text-center mt-2 font-mono">{todayString()}</p>
          </div>
          {onWatchReplay && (
            <button
              onClick={onWatchReplay}
              className="w-full py-2 bg-transparent border border-[#2a2a2a] text-[#888888] text-xs tracking-widest transition-colors hover:text-white hover:border-[#3a3a3a]"
            >
              WATCH REPLAY
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-sm mt-4 px-4">
        <div className="flex items-center justify-center gap-2">
          <span className="mc-header text-[10px]">CONTROLS:</span>
          <span className="text-[#555555] text-xs font-mono">SPACE to start | Arrow keys to move</span>
        </div>
      </div>
    </div>
  );
}
