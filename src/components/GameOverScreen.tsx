// Hopper - Game Over Screen Component

interface GameOverScreenProps {
  score: number;
  isNewHighScore: boolean;
}

export function GameOverScreen({ score, isNewHighScore }: GameOverScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
      <h2 className="text-3xl font-bold text-red-500 mb-4">GAME OVER</h2>
      <p className="text-white text-xl mb-2">Score: {score}</p>
      {isNewHighScore && (
        <p className="text-yellow-400 mb-4">NEW HIGH SCORE!</p>
      )}
      <p className="text-gray-300 animate-pulse mt-4">Press SPACE to restart</p>
    </div>
  );
}
