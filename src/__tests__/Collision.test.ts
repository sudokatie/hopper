// Hopper - Collision Detection Tests

import { rectanglesOverlap, checkRoadCollision, checkRiverSafe, checkHomeReached } from '../game/Collision';
import type { Rectangle, MovingObjectState } from '../game/types';

describe('rectanglesOverlap', () => {
  it('returns true when rectangles overlap', () => {
    const a: Rectangle = { x: 0, y: 0, width: 10, height: 10 };
    const b: Rectangle = { x: 5, y: 5, width: 10, height: 10 };
    expect(rectanglesOverlap(a, b)).toBe(true);
  });

  it('returns false when rectangles do not overlap', () => {
    const a: Rectangle = { x: 0, y: 0, width: 10, height: 10 };
    const b: Rectangle = { x: 20, y: 20, width: 10, height: 10 };
    expect(rectanglesOverlap(a, b)).toBe(false);
  });

  it('returns false when rectangles are adjacent but not overlapping', () => {
    const a: Rectangle = { x: 0, y: 0, width: 10, height: 10 };
    const b: Rectangle = { x: 10, y: 0, width: 10, height: 10 };
    expect(rectanglesOverlap(a, b)).toBe(false);
  });

  it('returns true when one rectangle is inside another', () => {
    const a: Rectangle = { x: 0, y: 0, width: 20, height: 20 };
    const b: Rectangle = { x: 5, y: 5, width: 5, height: 5 };
    expect(rectanglesOverlap(a, b)).toBe(true);
  });
});

describe('checkRoadCollision', () => {
  it('returns true when player collides with a car', () => {
    const playerHitbox: Rectangle = { x: 50, y: 100, width: 32, height: 32 };
    const objects = [{
      getHitbox: () => ({ x: 40, y: 100, width: 40, height: 40 }),
    }];
    expect(checkRoadCollision(playerHitbox, objects)).toBe(true);
  });

  it('returns false when player does not collide with any car', () => {
    const playerHitbox: Rectangle = { x: 50, y: 100, width: 32, height: 32 };
    const objects = [{
      getHitbox: () => ({ x: 200, y: 100, width: 40, height: 40 }),
    }];
    expect(checkRoadCollision(playerHitbox, objects)).toBe(false);
  });

  it('returns false when lane has no objects', () => {
    const playerHitbox: Rectangle = { x: 50, y: 100, width: 32, height: 32 };
    expect(checkRoadCollision(playerHitbox, [])).toBe(false);
  });
});

describe('checkRiverSafe', () => {
  const mockLogState: MovingObjectState = {
    type: 'log',
    x: 40,
    y: 2,
    width: 3,
    speed: 1,
    direction: 'right',
    variant: 0,
  };

  it('returns object state when player is on a log', () => {
    const playerHitbox: Rectangle = { x: 50, y: 80, width: 32, height: 32 };
    const objects = [{
      getHitbox: () => ({ x: 40, y: 80, width: 120, height: 40 }),
      getState: () => mockLogState,
    }];
    expect(checkRiverSafe(playerHitbox, objects)).toEqual(mockLogState);
  });

  it('returns null when player is in water (not on any log)', () => {
    const playerHitbox: Rectangle = { x: 50, y: 80, width: 32, height: 32 };
    const objects = [{
      getHitbox: () => ({ x: 300, y: 80, width: 120, height: 40 }),
      getState: () => mockLogState,
    }];
    expect(checkRiverSafe(playerHitbox, objects)).toBeNull();
  });

  it('returns null when river lane is empty', () => {
    const playerHitbox: Rectangle = { x: 50, y: 80, width: 32, height: 32 };
    expect(checkRiverSafe(playerHitbox, [])).toBeNull();
  });
});

describe('checkHomeReached', () => {
  const homes = [
    { column: 1, filled: false },
    { column: 4, filled: true },
    { column: 7, filled: false },
    { column: 10, filled: false },
    { column: 12, filled: false },
  ];

  it('returns home index when player lands on unfilled home', () => {
    expect(checkHomeReached(1, homes)).toBe(0);
    expect(checkHomeReached(7, homes)).toBe(2);
  });

  it('returns -1 when player lands on filled home', () => {
    expect(checkHomeReached(4, homes)).toBe(-1);
  });

  it('returns -1 when player lands between homes', () => {
    expect(checkHomeReached(3, homes)).toBe(-1);
    expect(checkHomeReached(6, homes)).toBe(-1);
  });
});
