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
- Retro sound effects (synthesized, no audio files needed)
- Background music (bouncy chiptune loops)
- High score leaderboard (compete against yourself)

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 and try not to get hit by traffic.

## Controls

### Keyboard
| Key | Action |
|-----|--------|
| Arrow keys / WASD | Hop |
| Space | Start / Restart |
| P | Pause |

### Mobile / Touch
| Gesture | Action |
|---------|--------|
| Swipe up/down/left/right | Hop |
| Tap | Start / Restart |

## Gameplay

1. Start at the bottom
2. Cross the road - cars and trucks don't stop for frogs
3. Cross the river - hop on logs (water is fatal, surprisingly)
4. Land in a home slot at the top
5. Fill all 5 homes to advance

Each level speeds up traffic, speeds up logs, and gives you less time. Eventually you will lose. That's the game.

## Sound

Sound effects are synthesized using the Web Audio API - no audio files needed. Simple retro beeps and boops for:
- Hopping
- Splashing (water death)
- Splatting (vehicle death)
- Reaching home
- Level complete
- Game over

The game exposes `toggleSound()`, `setVolume()`, and `getVolume()` methods if you want to add a mute button.

## Music

Background music is a bouncy, arcade-style chiptune loop generated entirely with the Web Audio API. No audio files, just synthesized triangle waves with that classic 8-bit feel.

Control music via the exported `Music` singleton:
- `Music.play()` - start the tunes
- `Music.stop()` - silence
- `Music.toggle()` - flip state
- `Music.setVolume(0-1)` - adjust level
- `Music.setEnabled(bool)` - enable/disable

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
- 74 tests for the bits that matter

## License

MIT

## Author

Katie

---

*No frogs were harmed in the making of this game. Several rectangles, however, met unfortunate ends.*
