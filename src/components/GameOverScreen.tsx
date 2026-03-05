// Hopper - Game Over Screen Component

import { DailyLeaderboard, generateShareCode, todayString } from '@/game/Daily';

interface GameOverScreenProps {
  score: number;
  isNewHighScore: boolean;
  dailyMode: boolean;
}

export function GameOverScreen({ score, isNewHighScore, dailyMode }: GameOverScreenProps) {
  const dailyScores = dailyMode ? DailyLeaderboard.getToday() : [];
  const shareCode = dailyMode ? generateShareCode(todayString(), score) : '';
  const dailyRank = dailyMode ? dailyScores.findIndex(s => s.score === score) + 1 : 0;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
      <h2 className="text-3xl font-bold text-red-500 mb-4">GAME OVER</h2>
      <p className="text-white text-xl mb-2">Score: {score}</p>
      
      {dailyMode ? (
        <>
          <p className="text-purple-400 mb-2">Daily Challenge - {todayString()}</p>
          {dailyRank > 0 && dailyRank <= 10 && (
            <p className="text-yellow-400 mb-2">Daily Rank: #{dailyRank}</p>
          )}
          <p className="text-gray-400 text-sm mb-4">
            Share: <span className="text-purple-300 font-mono">{shareCode}</span>
          </p>
          
          {dailyScores.length > 0 && (
            <div className="bg-black/50 p-3 rounded mb-4 max-h-32 overflow-y-auto">
              <p className="text-purple-300 text-sm mb-2">Today&apos;s Top Scores:</p>
              {dailyScores.slice(0, 5).map((entry, i) => (
                <p key={i} className="text-gray-300 text-sm">
                  {i + 1}. {entry.name} - {entry.score}
                </p>
              ))}
            </div>
          )}
        </>
      ) : (
        isNewHighScore && (
          <p className="text-yellow-400 mb-4">NEW HIGH SCORE!</p>
        )
      )}
      
      <p className="text-gray-300 animate-pulse mt-4">Press SPACE to restart</p>
    </div>
  );
}
