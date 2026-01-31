// Hopper - HUD Component

interface HUDProps {
  score: number;
  highScore: number;
  level: number;
  lives: number;
  timeRemaining: number;
  maxTime: number;
}

export function HUD({ score, highScore, level, lives, timeRemaining, maxTime }: HUDProps) {
  return (
    <>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 bg-black/70 px-2 py-1 flex justify-between text-xs">
        <span className="text-white">Score: {score}</span>
        <span className="text-gray-400">HI: {highScore}</span>
        <span className="text-yellow-400">Lv{level}</span>
        <span className="text-white">
          {'🐸'.repeat(lives)}
        </span>
      </div>

      {/* Timer bar */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-800">
        <div
          className="h-full bg-green-500 transition-all duration-100"
          style={{ width: `${(timeRemaining / maxTime) * 100}%` }}
        />
      </div>
    </>
  );
}
