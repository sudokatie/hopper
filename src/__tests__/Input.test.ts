// Input tests

import { Input } from '../game/Input';

describe('Input', () => {
  let input: Input;
  let directionCallback: jest.Mock;
  let actionCallback: jest.Mock;

  beforeEach(() => {
    input = new Input();
    directionCallback = jest.fn();
    actionCallback = jest.fn();
    input.onDirection(directionCallback);
    input.onAction(actionCallback);
    input.attach();
  });

  afterEach(() => {
    input.detach();
  });

  describe('keyboard input', () => {
    it('should handle arrow up', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      expect(directionCallback).toHaveBeenCalledWith('up');
    });

    it('should handle arrow down', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(directionCallback).toHaveBeenCalledWith('down');
    });

    it('should handle arrow left', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      expect(directionCallback).toHaveBeenCalledWith('left');
    });

    it('should handle arrow right', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(directionCallback).toHaveBeenCalledWith('right');
    });

    it('should handle WASD keys', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
      expect(directionCallback).toHaveBeenCalledWith('up');
      
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
      expect(directionCallback).toHaveBeenCalledWith('down');
      
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      expect(directionCallback).toHaveBeenCalledWith('left');
      
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
      expect(directionCallback).toHaveBeenCalledWith('right');
    });

    it('should handle space for start', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      expect(actionCallback).toHaveBeenCalledWith('start');
    });

    it('should handle p for pause', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
      expect(actionCallback).toHaveBeenCalledWith('pause');
    });
  });

  describe('touch input', () => {
    function createTouchEvent(type: string, x: number, y: number): TouchEvent {
      const touch = {
        clientX: x,
        clientY: y,
        identifier: 0,
        target: document.body,
      } as Touch;
      
      return new TouchEvent(type, {
        touches: type === 'touchstart' ? [touch] : [],
        changedTouches: [touch],
      });
    }

    it('should detect swipe right', () => {
      window.dispatchEvent(createTouchEvent('touchstart', 100, 100));
      window.dispatchEvent(createTouchEvent('touchend', 200, 100));
      expect(directionCallback).toHaveBeenCalledWith('right');
    });

    it('should detect swipe left', () => {
      window.dispatchEvent(createTouchEvent('touchstart', 200, 100));
      window.dispatchEvent(createTouchEvent('touchend', 100, 100));
      expect(directionCallback).toHaveBeenCalledWith('left');
    });

    it('should detect swipe up', () => {
      window.dispatchEvent(createTouchEvent('touchstart', 100, 200));
      window.dispatchEvent(createTouchEvent('touchend', 100, 100));
      expect(directionCallback).toHaveBeenCalledWith('up');
    });

    it('should detect swipe down', () => {
      window.dispatchEvent(createTouchEvent('touchstart', 100, 100));
      window.dispatchEvent(createTouchEvent('touchend', 100, 200));
      expect(directionCallback).toHaveBeenCalledWith('down');
    });

    it('should detect tap as action', () => {
      // Note: Quick tap detection uses timing, hard to test exactly
      // Just verify swipe threshold works
      window.dispatchEvent(createTouchEvent('touchstart', 100, 100));
      window.dispatchEvent(createTouchEvent('touchend', 105, 105));
      // Small movement + quick time = tap (action)
      expect(actionCallback).toHaveBeenCalledWith('start');
    });

    it('should ignore small movements below threshold', () => {
      // Reset mocks
      directionCallback.mockClear();
      actionCallback.mockClear();
      
      window.dispatchEvent(createTouchEvent('touchstart', 100, 100));
      // Sleep a bit to make it not a "quick tap"
      window.dispatchEvent(createTouchEvent('touchend', 115, 115));
      // 15px movement, below 30px threshold, but >200ms = no action
      // Actually this would still trigger tap since it's instant in test
      // Let's just verify directionCallback wasn't called
      expect(directionCallback).not.toHaveBeenCalled();
    });
  });

  describe('attach/detach', () => {
    it('should not process events when detached', () => {
      input.detach();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      expect(directionCallback).not.toHaveBeenCalled();
    });

    it('should process events after reattach', () => {
      input.detach();
      input.attach();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      expect(directionCallback).toHaveBeenCalledWith('up');
    });
  });
});
