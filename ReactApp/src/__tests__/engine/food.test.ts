import { describe, it, expect } from 'vitest';
import { Food } from '../../engine/food';
import { TAU } from '../../engine/utils';

describe('Food', () => {
  it('initializes with given position', () => {
    const f = new Food(100, 200);
    expect(f.x).toBe(100);
    expect(f.y).toBe(200);
  });

  it('starts not eaten', () => {
    const f = new Food(0, 0);
    expect(f.eaten).toBe(false);
  });

  it('has a phase in [0, TAU)', () => {
    const f = new Food(0, 0);
    expect(f.phase).toBeGreaterThanOrEqual(0);
    expect(f.phase).toBeLessThan(TAU);
  });

  describe('update', () => {
    it('advances phase', () => {
      const f = new Food(0, 0);
      const initial = f.phase;
      f.update(1);
      expect(f.phase).not.toBe(initial);
    });

    it('wraps phase around TAU', () => {
      const f = new Food(0, 0);
      f.phase = TAU - 0.01;
      f.update(1); // adds 2.5 → well over TAU
      expect(f.phase).toBeLessThan(TAU);
      expect(f.phase).toBeGreaterThanOrEqual(0);
    });
  });

  describe('pulse', () => {
    it('returns a value near 1', () => {
      const f = new Food(0, 0);
      expect(f.pulse).toBeGreaterThanOrEqual(0.75);
      expect(f.pulse).toBeLessThanOrEqual(1.25);
    });

    it('varies with phase', () => {
      const f = new Food(0, 0);
      f.phase = 0;
      const pulse0 = f.pulse;
      f.phase = Math.PI / 2;
      const pulsePiHalf = f.pulse;
      expect(pulse0).not.toBeCloseTo(pulsePiHalf);
    });
  });
});
