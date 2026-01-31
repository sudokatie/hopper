// Hopper - Home Slot Management

import { HOME_COLUMNS } from './constants';
import type { HomeState } from './types';

export class HomeManager {
  private homes: HomeState[];

  constructor() {
    this.homes = this.createHomes();
  }

  private createHomes(): HomeState[] {
    return HOME_COLUMNS.map(col => ({ column: col, filled: false }));
  }

  fillHome(index: number): boolean {
    if (index < 0 || index >= this.homes.length) {
      return false;
    }
    if (this.homes[index].filled) {
      return false;
    }
    this.homes[index].filled = true;
    return true;
  }

  isHomeFilled(index: number): boolean {
    if (index < 0 || index >= this.homes.length) {
      return true; // Treat invalid index as filled (can't land there)
    }
    return this.homes[index].filled;
  }

  findHomeAtColumn(column: number): number {
    return this.homes.findIndex(h => h.column === column && !h.filled);
  }

  allHomesFilled(): boolean {
    return this.homes.every(h => h.filled);
  }

  reset(): void {
    this.homes = this.createHomes();
  }

  getState(): HomeState[] {
    return this.homes.map(h => ({ ...h }));
  }
}
