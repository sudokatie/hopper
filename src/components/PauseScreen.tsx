// Hopper - Pause Screen Component

export function PauseScreen() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
      <h2 className="text-3xl font-bold text-yellow-400 mb-4">PAUSED</h2>
      <p className="text-gray-300">Press P to resume</p>
    </div>
  );
}
