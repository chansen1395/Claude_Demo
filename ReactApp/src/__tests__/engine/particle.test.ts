import { describe, it, expect } from 'vitest';
import { Particle } from '../../engine/particle';

describe('Particle', () => {
  it('initializes with given values', () => {
    const p = new Particle(10, 20, 5, -3, '#ff0000', 1.0);
    expect(p.x).toBe(10);
    expect(p.y).toBe(20);
    expect(p.vx).toBe(5);
    expect(p.vy).toBe(-3);
    expect(p.color).toBe('#ff0000');
    expect(p.life).toBe(1.0);
    expect(p.maxLife).toBe(1.0);
  });

  it('has a size between 2 and 4', () => {
    const p = new Particle(0, 0, 0, 0, '', 1);
    expect(p.sz).toBeGreaterThanOrEqual(2);
    expect(p.sz).toBeLessThan(4);
  });

  describe('update', () => {
    it('moves position based on velocity', () => {
      const p = new Particle(0, 0, 10, -5, '', 1);
      p.update(0.5);
      expect(p.x).toBeCloseTo(5);
      expect(p.y).toBeCloseTo(-2.5);
    });

    it('reduces life by dt', () => {
      const p = new Particle(0, 0, 0, 0, '', 1);
      p.update(0.3);
      expect(p.life).toBeCloseTo(0.7);
    });
  });

  describe('alpha', () => {
    it('returns 1 when life equals maxLife', () => {
      const p = new Particle(0, 0, 0, 0, '', 1);
      expect(p.alpha).toBeCloseTo(1);
    });

    it('returns fraction as life decreases', () => {
      const p = new Particle(0, 0, 0, 0, '', 1);
      p.life = 0.5;
      expect(p.alpha).toBeCloseTo(0.5);
    });

    it('returns 0 when life is 0 or negative', () => {
      const p = new Particle(0, 0, 0, 0, '', 1);
      p.life = 0;
      expect(p.alpha).toBe(0);
      p.life = -1;
      expect(p.alpha).toBe(0);
    });
  });

  describe('dead', () => {
    it('is false when life > 0', () => {
      const p = new Particle(0, 0, 0, 0, '', 1);
      expect(p.dead).toBe(false);
    });

    it('is true when life <= 0', () => {
      const p = new Particle(0, 0, 0, 0, '', 1);
      p.life = 0;
      expect(p.dead).toBe(true);
      p.life = -0.5;
      expect(p.dead).toBe(true);
    });
  });
});
