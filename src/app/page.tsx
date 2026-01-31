'use client';

import { GameCanvas } from '@/components/GameCanvas';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-green-400 mb-4">HOPPER</h1>
      <GameCanvas />
      <p className="text-gray-400 mt-4 text-sm">
        Use arrow keys to move
      </p>
    </main>
  );
}
