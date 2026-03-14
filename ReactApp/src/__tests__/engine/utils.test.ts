import { describe, it, expect, vi } from 'vitest';
import { TAU, gaussRand, sigmoid, clamp, dist, normAngle, hsl } from '../../engine/utils';

describe('utils', () => {
  describe('TAU', () => {
    it('equals 2 * PI', () => {
      expect(TAU).toBeCloseTo(Math.PI * 2, 10);
    });
  });

  describe('gaussRand', () => {
    it('returns a number', () => {
      expect(typeof gaussRand()).toBe('number');
    });

    it('produces varied output over multiple calls', () => {
      const values = new Set<number>();
      for (let i = 0; i < 50; i++) values.add(gaussRand());
      expect(values.size).toBeGreaterThan(1);
    });

    it('handles uniformA=0 fallback', () => {
      const orig = Math.random;
      let callCount = 0;
      Math.random = () => {
        callCount++;
        return callCount === 1 ? 0 : 0.5;
      };
      const result = gaussRand();
      Math.random = orig;
      expect(typeof result).toBe('number');
      expect(Number.isFinite(result)).toBe(true);
    });
  });

  describe('sigmoid', () => {
    it('returns 0.5 for input 0', () => {
      expect(sigmoid(0)).toBeCloseTo(0.5);
    });

    it('returns close to 1 for large positive input', () => {
      expect(sigmoid(10)).toBeCloseTo(1, 3);
    });

    it('returns close to 0 for large negative input', () => {
      expect(sigmoid(-10)).toBeCloseTo(0, 3);
    });

    it('returns exactly 1 for x > 15 (clamped branch)', () => {
      expect(sigmoid(16)).toBe(1);
      expect(sigmoid(100)).toBe(1);
    });

    it('returns exactly 0 for x < -15 (clamped branch)', () => {
      expect(sigmoid(-16)).toBe(0);
      expect(sigmoid(-100)).toBe(0);
    });
  });

  describe('clamp', () => {
    it('returns value when within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('returns min when value is below', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('returns max when value is above', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('returns boundary values exactly', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('dist', () => {
    it('returns 0 for identical points', () => {
      expect(dist({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
    });

    it('computes correct distance for known case', () => {
      expect(dist({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5);
    });

    it('is commutative', () => {
      const a = { x: 1, y: 2 };
      const b = { x: 4, y: 6 };
      expect(dist(a, b)).toBeCloseTo(dist(b, a));
    });
  });

  describe('normAngle', () => {
    it('normalizes 0 to 0', () => {
      expect(normAngle(0)).toBeCloseTo(0);
    });

    it('normalizes angles greater than PI', () => {
      const result = normAngle(Math.PI + 1);
      expect(result).toBeLessThanOrEqual(Math.PI);
      expect(result).toBeGreaterThanOrEqual(-Math.PI);
    });

    it('normalizes angles less than -PI', () => {
      const result = normAngle(-Math.PI - 1);
      expect(result).toBeLessThanOrEqual(Math.PI);
      expect(result).toBeGreaterThanOrEqual(-Math.PI);
    });

    it('normalizes large positive angles', () => {
      const result = normAngle(TAU * 3 + 0.5);
      expect(result).toBeCloseTo(0.5);
    });

    it('normalizes large negative angles', () => {
      const result = normAngle(-TAU * 3 - 0.5);
      expect(result).toBeCloseTo(-0.5);
    });
  });

  describe('hsl', () => {
    it('returns hsl string without alpha', () => {
      expect(hsl(120, 50, 70)).toBe('hsl(120,50%,70%)');
    });

    it('returns hsla string with alpha', () => {
      expect(hsl(120, 50, 70, 0.5)).toBe('hsla(120,50%,70%,0.5)');
    });

    it('handles zero alpha', () => {
      expect(hsl(0, 0, 0, 0)).toBe('hsla(0,0%,0%,0)');
    });
  });
});
