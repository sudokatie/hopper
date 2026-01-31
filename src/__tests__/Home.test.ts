// Hopper - Home Manager Tests

import { HomeManager } from '../game/Home';
import { HOME_COLUMNS } from '../game/constants';

describe('HomeManager', () => {
  let homeManager: HomeManager;

  beforeEach(() => {
    homeManager = new HomeManager();
  });

  describe('initialization', () => {
    it('creates correct number of homes', () => {
      const homes = homeManager.getState();
      expect(homes.length).toBe(HOME_COLUMNS.length);
    });

    it('initializes all homes as unfilled', () => {
      const homes = homeManager.getState();
      expect(homes.every(h => !h.filled)).toBe(true);
    });

    it('creates homes at correct columns', () => {
      const homes = homeManager.getState();
      expect(homes.map(h => h.column)).toEqual(HOME_COLUMNS);
    });
  });

  describe('fillHome', () => {
    it('fills a home at valid index', () => {
      expect(homeManager.fillHome(0)).toBe(true);
      expect(homeManager.isHomeFilled(0)).toBe(true);
    });

    it('returns false for already filled home', () => {
      homeManager.fillHome(0);
      expect(homeManager.fillHome(0)).toBe(false);
    });

    it('returns false for invalid index', () => {
      expect(homeManager.fillHome(-1)).toBe(false);
      expect(homeManager.fillHome(100)).toBe(false);
    });
  });

  describe('findHomeAtColumn', () => {
    it('returns index for unfilled home at column', () => {
      const index = homeManager.findHomeAtColumn(HOME_COLUMNS[0]);
      expect(index).toBe(0);
    });

    it('returns -1 for filled home at column', () => {
      homeManager.fillHome(0);
      const index = homeManager.findHomeAtColumn(HOME_COLUMNS[0]);
      expect(index).toBe(-1);
    });

    it('returns -1 for column with no home', () => {
      const index = homeManager.findHomeAtColumn(999);
      expect(index).toBe(-1);
    });
  });

  describe('allHomesFilled', () => {
    it('returns false when no homes filled', () => {
      expect(homeManager.allHomesFilled()).toBe(false);
    });

    it('returns false when some homes filled', () => {
      homeManager.fillHome(0);
      homeManager.fillHome(1);
      expect(homeManager.allHomesFilled()).toBe(false);
    });

    it('returns true when all homes filled', () => {
      for (let i = 0; i < HOME_COLUMNS.length; i++) {
        homeManager.fillHome(i);
      }
      expect(homeManager.allHomesFilled()).toBe(true);
    });
  });

  describe('reset', () => {
    it('clears all filled homes', () => {
      homeManager.fillHome(0);
      homeManager.fillHome(1);
      homeManager.reset();
      expect(homeManager.getState().every(h => !h.filled)).toBe(true);
    });
  });

  describe('getState', () => {
    it('returns a copy of homes', () => {
      const state1 = homeManager.getState();
      state1[0].filled = true;
      const state2 = homeManager.getState();
      expect(state2[0].filled).toBe(false);
    });
  });
});
