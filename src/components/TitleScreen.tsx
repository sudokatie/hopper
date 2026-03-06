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
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
      <h1 className="text-4xl font-bold text-green-400 mb-4">HOPPER</h1>
      <p className="text-gray-300 mb-2">Cross the road. Ride the logs.</p>
      <p className="text-gray-300 mb-6">Reach home.</p>
      {highScore > 0 && (
        <p className="text-yellow-400 mb-4">High Score: {highScore}</p>
      )}
      
      <div className="flex flex-col gap-3 mt-4">
        <button
          onClick={onStartNormal}
          className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded transition-colors"
        >
          PLAY
        </button>
        <button
          onClick={onStartDaily}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded transition-colors"
        >
          DAILY CHALLENGE
        </button>
        <p className="text-purple-300 text-sm text-center">{todayString()}</p>
        {onWatchReplay && (
          <button
            onClick={onWatchReplay}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-colors"
          >
            WATCH REPLAY
          </button>
        )}
      </div>
      
      <p className="text-gray-400 text-sm mt-4">Press SPACE for normal mode</p>
    </div>
  );
}
