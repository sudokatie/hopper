// Hopper - Title Screen Component

interface TitleScreenProps {
  highScore: number;
}

export function TitleScreen({ highScore }: TitleScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
      <h1 className="text-4xl font-bold text-green-400 mb-4">HOPPER</h1>
      <p className="text-gray-300 mb-2">Cross the road. Ride the logs.</p>
      <p className="text-gray-300 mb-6">Reach home.</p>
      {highScore > 0 && (
        <p className="text-yellow-400 mb-4">High Score: {highScore}</p>
      )}
      <p className="text-white animate-pulse">Press SPACE to start</p>
    </div>
  );
}
