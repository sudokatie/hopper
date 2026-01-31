# Hopper

A browser-based Frogger remake. Because sometimes you just need to help a frog cross the road.

## Why This Exists

Every developer has a moment where they think "I could rebuild that arcade game from my childhood in a weekend." Most of us are wrong. But Frogger? Frogger is actually doable.

No game engine. No physics library. No 47 npm packages that each do one thing. Just Canvas, some rectangles pretending to be frogs, and the eternal struggle of timing your jump between two trucks.

## Features

- Classic Frogger gameplay (cross road, ride logs, don't die)
- 5 homes to fill per level
- Difficulty scaling that actually works (traffic gets faster, time gets shorter)
- High score persistence (your shame is saved locally)
- Pause functionality (for when your boss walks by)

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 and try not to get hit by traffic.

## Controls

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Hop |
| Space | Start / Restart |
| P | Pause |

## Gameplay

1. Start at the bottom
2. Cross the road - cars and trucks don't stop for frogs
3. Cross the river - hop on logs (water is fatal, surprisingly)
4. Land in a home slot at the top
5. Fill all 5 homes to advance

Each level speeds up traffic, speeds up logs, and gives you less time. Eventually you will lose. That's the game.

## Scoring

| Action | Points |
|--------|--------|
| Hop forward | +10 |
| Fill home | +50 |
| Complete level | +1000 |
| Time bonus | +10 per second remaining |

## Tech Stack

- Next.js 14 + TypeScript
- HTML5 Canvas (no game engine)
- Tailwind CSS for UI chrome
- 30 tests for the bits that matter

## License

MIT

## Author

Katie

---

*No frogs were harmed in the making of this game. Several rectangles, however, met unfortunate ends.*
