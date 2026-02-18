// Hopper - Keyboard and Touch Input Handler

import type { Direction } from './types';

type DirectionCallback = (direction: Direction) => void;
type ActionCallback = (action: 'start' | 'pause') => void;

// Minimum swipe distance in pixels
const SWIPE_THRESHOLD = 30;

export class Input {
  private directionCallback: DirectionCallback | null = null;
  private actionCallback: ActionCallback | null = null;
  private attached: boolean = false;

  // Touch tracking
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchStartTime: number = 0;

  onDirection(callback: DirectionCallback): void {
    this.directionCallback = callback;
  }

  onAction(callback: ActionCallback): void {
    this.actionCallback = callback;
  }

  attach(): void {
    if (this.attached) return;
    this.attached = true;
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    window.addEventListener('touchend', this.handleTouchEnd, { passive: false });
  }

  detach(): void {
    if (!this.attached) return;
    this.attached = false;
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchend', this.handleTouchEnd);
  }

  private handleTouchStart = (event: TouchEvent): void => {
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
    event.preventDefault();
  };

  private handleTouchEnd = (event: TouchEvent): void => {
    if (event.changedTouches.length !== 1) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    const deltaTime = Date.now() - this.touchStartTime;
    event.preventDefault();

    // Quick tap = start/action
    if (Math.abs(deltaX) < SWIPE_THRESHOLD && Math.abs(deltaY) < SWIPE_THRESHOLD && deltaTime < 200) {
      if (this.actionCallback) {
        this.actionCallback('start');
      }
      return;
    }

    // Swipe detection
    if (this.directionCallback) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > SWIPE_THRESHOLD) {
          this.directionCallback('right');
        } else if (deltaX < -SWIPE_THRESHOLD) {
          this.directionCallback('left');
        }
      } else {
        // Vertical swipe
        if (deltaY > SWIPE_THRESHOLD) {
          this.directionCallback('down');
        } else if (deltaY < -SWIPE_THRESHOLD) {
          this.directionCallback('up');
        }
      }
    }
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    // Prevent default for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' ', 'p'].includes(event.key)) {
      event.preventDefault();
    }

    // Direction keys
    if (this.directionCallback) {
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          this.directionCallback('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          this.directionCallback('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.directionCallback('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.directionCallback('right');
          break;
      }
    }

    // Action keys
    if (this.actionCallback) {
      switch (event.key) {
        case ' ':
          this.actionCallback('start');
          break;
        case 'p':
        case 'P':
          this.actionCallback('pause');
          break;
      }
    }
  };
}
