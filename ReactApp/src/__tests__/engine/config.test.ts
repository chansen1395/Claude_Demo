import { describe, it, expect } from 'vitest';
import { CFG } from '../../engine/config';

describe('config', () => {
  it('exports CFG with world dimensions', () => {
    expect(CFG.W).toBe(900);
    expect(CFG.H).toBe(650);
  });

  it('has valid initial population counts', () => {
    expect(CFG.INIT_HERBS).toBeGreaterThan(0);
    expect(CFG.INIT_CARNS).toBeGreaterThan(0);
    expect(CFG.INIT_OMNIS).toBeGreaterThan(0);
  });

  it('has minimum populations less than or equal to initial', () => {
    expect(CFG.MIN_HERBS).toBeLessThanOrEqual(CFG.INIT_HERBS);
    expect(CFG.MIN_CARNS).toBeLessThanOrEqual(CFG.INIT_CARNS);
    expect(CFG.MIN_OMNIS).toBeLessThanOrEqual(CFG.INIT_OMNIS);
  });

  it('has a valid topology', () => {
    expect(CFG.TOPOLOGY).toEqual([10, 8, 6, 3]);
  });

  it('has valid mutation parameters', () => {
    expect(CFG.MUT_RATE).toBeGreaterThan(0);
    expect(CFG.MUT_RATE).toBeLessThan(1);
    expect(CFG.MUT_STR).toBeGreaterThan(0);
  });

  it('has all species configs', () => {
    // Herbivore
    expect(CFG.HERB_SPEED).toBeGreaterThan(0);
    expect(CFG.HERB_MAX_E).toBeGreaterThan(0);
    expect(CFG.HERB_SZ).toBeGreaterThan(0);
    // Carnivore
    expect(CFG.CARN_SPEED).toBeGreaterThan(0);
    expect(CFG.CARN_MAX_E).toBeGreaterThan(0);
    expect(CFG.CARN_SZ).toBeGreaterThan(0);
    // Omnivore
    expect(CFG.OMNI_SPEED).toBeGreaterThan(0);
    expect(CFG.OMNI_MAX_E).toBeGreaterThan(0);
    expect(CFG.OMNI_SZ).toBeGreaterThan(0);
  });
});
