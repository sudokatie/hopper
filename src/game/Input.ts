// Hopper - Keyboard Input Handler

import type { Direction } from './types';

type DirectionCallback = (direction: Direction) => void;
type ActionCallback = (action: 'start' | 'pause') => void;

export class Input {
  private directionCallback: DirectionCallback | null = null;
  private actionCallback: ActionCallback | null = null;
  private attached: boolean = false;

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
  }

  detach(): void {
    if (!this.attached) return;
    this.attached = false;
    window.removeEventListener('keydown', this.handleKeyDown);
  }

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
