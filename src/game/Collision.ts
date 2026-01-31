// Hopper - Collision Detection

import type { Rectangle, MovingObjectState } from './types';

/**
 * Check if two rectangles overlap
 */
export function rectanglesOverlap(
  a: Rectangle,
  b: Rectangle
): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Check if player collides with any object in a road lane
 * Returns true if collision detected (death)
 */
export function checkRoadCollision(
  playerHitbox: Rectangle,
  objects: { getHitbox: () => Rectangle }[]
): boolean {
  for (const obj of objects) {
    if (rectanglesOverlap(playerHitbox, obj.getHitbox())) {
      return true;
    }
  }
  return false;
}

/**
 * Check if player is safely on a river object
 * Returns the object state if riding, null if in water (death)
 */
export function checkRiverSafe(
  playerHitbox: Rectangle,
  objects: { getHitbox: () => Rectangle; getState: () => MovingObjectState }[]
): MovingObjectState | null {
  for (const obj of objects) {
    if (rectanglesOverlap(playerHitbox, obj.getHitbox())) {
      return obj.getState();
    }
  }
  return null;
}

/**
 * Check if player has reached a valid home slot
 * Returns home index if valid, -1 if invalid landing
 */
export function checkHomeReached(
  playerX: number,
  homes: { column: number; filled: boolean }[]
): number {
  return homes.findIndex(h => h.column === playerX && !h.filled);
}
