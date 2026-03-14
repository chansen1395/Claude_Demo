import { describe, it, expect, afterEach, vi } from 'vitest';
import { setupSimCanvas, renderSim, type SimRendererState } from '../../renderers/simRenderer';
import { Simulation } from '../../engine/simulation';
import { Creature, resetCreatureId } from '../../engine/creature';
import { Food } from '../../engine/food';
import { Particle } from '../../engine/particle';

describe('simRenderer', () => {
  function createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const parent = document.createElement('div');
    parent.appendChild(canvas);
    return canvas;
  }

  describe('setupSimCanvas', () => {
    it('returns state with dimensions and scale', () => {
      const canvas = createCanvas();
      const state = setupSimCanvas(canvas);
      expect(state).toHaveProperty('w');
      expect(state).toHaveProperty('h');
      expect(state).toHaveProperty('sx');
      expect(state).toHaveProperty('sy');
      expect(state.w).toBeGreaterThan(0);
      expect(state.h).toBeGreaterThan(0);
    });

    it('sets canvas width/height to scaled dimensions', () => {
      const canvas = createCanvas();
      setupSimCanvas(canvas);
      expect(canvas.width).toBeGreaterThan(0);
      expect(canvas.height).toBeGreaterThan(0);
    });

    it('falls back to dpr=1 when devicePixelRatio is 0', () => {
      const origDpr = window.devicePixelRatio;
      Object.defineProperty(window, 'devicePixelRatio', { value: 0, writable: true, configurable: true });
      const canvas = createCanvas();
      const state = setupSimCanvas(canvas);
      Object.defineProperty(window, 'devicePixelRatio', { value: origDpr, writable: true, configurable: true });
      expect(state.w).toBeGreaterThan(0);
    });
  });

  describe('renderSim', () => {
    it('renders without errors', () => {
      resetCreatureId();
      const canvas = createCanvas();
      const state = setupSimCanvas(canvas);
      const sim = new Simulation();
      expect(() => renderSim(canvas, sim, null, true, state)).not.toThrow();
    });

    it('renders with a selected creature', () => {
      resetCreatureId();
      const canvas = createCanvas();
      const state = setupSimCanvas(canvas);
      const sim = new Simulation();
      const creature = sim.creatures[0]!;
      // Give creature activations so it renders properly
      creature.update(1 / 60, sim);
      expect(() => renderSim(canvas, sim, creature, true, state)).not.toThrow();
    });

    it('renders without trails', () => {
      resetCreatureId();
      const canvas = createCanvas();
      const state = setupSimCanvas(canvas);
      const sim = new Simulation();
      expect(() => renderSim(canvas, sim, null, false, state)).not.toThrow();
    });

    it('renders with particles', () => {
      resetCreatureId();
      const canvas = createCanvas();
      const state = setupSimCanvas(canvas);
      const sim = new Simulation();
      sim.burst(100, 100, '#ff0000', 10, 50);
      expect(() => renderSim(canvas, sim, null, true, state)).not.toThrow();
    });

    it('renders with trails on creatures', () => {
      resetCreatureId();
      const canvas = createCanvas();
      const state = setupSimCanvas(canvas);
      const sim = new Simulation();
      // Give creatures some trail points
      for (let i = 0; i < 5; i++) sim.update(1/60);
      expect(() => renderSim(canvas, sim, null, true, state)).not.toThrow();
    });

    it('renders energy bar colors for medium and low energy creatures', () => {
      resetCreatureId();
      const canvas = createCanvas();
      const state = setupSimCanvas(canvas);
      const sim = new Simulation();
      // Set creatures to different energy fractions to cover all three color branches
      const c1 = sim.creatures[0]!;
      const c2 = sim.creatures[1]!;
      const c3 = sim.creatures[2]!;
      c1.energy = c1.maxE * 0.5; // >0.3 green
      c2.energy = c2.maxE * 0.2; // >0.15 yellow
      c3.energy = c3.maxE * 0.1; // <=0.15 red
      expect(() => renderSim(canvas, sim, null, false, state)).not.toThrow();
    });
  });
});
