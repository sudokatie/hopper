// Hopper - Level Complete Screen Component

interface LevelCompleteScreenProps {
  level: number;
  score: number;
}

export function LevelCompleteScreen({ level, score }: LevelCompleteScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
      <h2 className="text-3xl font-bold text-green-400 mb-4">LEVEL {level} COMPLETE!</h2>
      <p className="text-white text-xl">Score: {score}</p>
    </div>
  );
}
