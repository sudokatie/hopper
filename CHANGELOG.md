# Changelog

## 1.0.3 (2026-01-31)

Architecture improvements per spec review.

- Extracted HomeManager class (per TODOS.md spec)
- Integrated Score class properly (was inline in Game.ts)
- Added 14 new unit tests for HomeManager
- Total tests: 44 (up from 30)

## 1.0.2 (2026-01-31)

Documentation improvements.

- Rewrote README with personality and proper structure
- Added Author section
- Clarified home column constants comment

## 1.0.1 (2026-01-31)

Spec compliance fixes.

- Fixed: 5 home slots instead of 4 (per spec)
- Fixed: Offscreen death when riding log off screen edge
- Fixed: Pause functionality (P key)
- Fixed: Difficulty scaling (+15% traffic, +10% river per level)
- Fixed: Time limit decreases per level (-2s, min 30s)
- Fixed: High score shown in HUD during gameplay
- Added: Pause overlay

## 1.0.0 (2026-01-31)

Initial release.

- Classic Frogger gameplay
- Road with cars and trucks
- River with logs to ride
- Level progression with difficulty scaling
- High score persistence (localStorage)
- Responsive canvas rendering
- Keyboard controls (arrows + WASD + P)
