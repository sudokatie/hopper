// Hopper - Game Loop Manager

export class GameLoop {
  private updateFn: (deltaTime: number) => void;
  private renderFn: () => void;
  private running: boolean = false;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;

  constructor(
    updateFn: (deltaTime: number) => void,
    renderFn: () => void
  ) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  isRunning(): boolean {
    return this.running;
  }

  private tick = (): void => {
    if (!this.running) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.updateFn(deltaTime);
    this.renderFn();

    this.animationFrameId = requestAnimationFrame(this.tick);
  };
}
