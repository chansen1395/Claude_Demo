import { describe, it, expect } from 'vitest';
import { setupBrainCanvas, renderBrain, type BrainVizSize } from '../../renderers/brainRenderer';
import { Creature, resetCreatureId } from '../../engine/creature';
import { Simulation } from '../../engine/simulation';

describe('brainRenderer', () => {
  function createCanvas(): HTMLCanvasElement {
    return document.createElement('canvas');
  }

  describe('setupBrainCanvas', () => {
    it('returns size object', () => {
      const canvas = createCanvas();
      const size = setupBrainCanvas(canvas);
      expect(size).toHaveProperty('w');
      expect(size).toHaveProperty('h');
    });

    it('falls back to dpr=1 when devicePixelRatio is 0', () => {
      const origDpr = window.devicePixelRatio;
      Object.defineProperty(window, 'devicePixelRatio', { value: 0, writable: true, configurable: true });
      const canvas = createCanvas();
      const size = setupBrainCanvas(canvas);
      Object.defineProperty(window, 'devicePixelRatio', { value: origDpr, writable: true, configurable: true });
      expect(size.w).toBeGreaterThan(0);
    });
  });

  describe('renderBrain', () => {
    it('returns null when creature is null', () => {
      const canvas = createCanvas();
      const size: BrainVizSize = { w: 300, h: 220 };
      const result = renderBrain(canvas, null, size);
      expect(result).toBeNull();
    });

    it('returns null when creature has no activations', () => {
      resetCreatureId();
      const canvas = createCanvas();
      const size: BrainVizSize = { w: 300, h: 220 };
      const creature = new Creature(100, 100, 'herb');
      // acts is null by default
      const result = renderBrain(canvas, creature, size);
      expect(result).toBeNull();
    });

    it('returns stats when creature has activations', () => {
      resetCreatureId();
      const canvas = createCanvas();
      const size: BrainVizSize = { w: 300, h: 220 };
      const sim = new Simulation();
      const creature = sim.creatures[0]!;
      creature.update(1 / 60, sim); // populates acts
      const result = renderBrain(canvas, creature, size);
      expect(result).not.toBeNull();
      expect(result!.species).toBe('Herbivore');
      expect(result!.speciesColor).toBe('#00ff88');
    });

    it('returns correct stats for carnivore', () => {
      resetCreatureId();
      const canvas = createCanvas();
      const size: BrainVizSize = { w: 300, h: 220 };
      const sim = new Simulation();
      const carn = sim.creatures.find(c => c.carn)!;
      carn.update(1 / 60, sim);
      const result = renderBrain(canvas, carn, size);
      expect(result!.species).toBe('Carnivore');
      expect(result!.speciesColor).toBe('#ff4466');
    });

    it('returns correct stats for omnivore', () => {
      resetCreatureId();
      const canvas = createCanvas();
      const size: BrainVizSize = { w: 300, h: 220 };
      const sim = new Simulation();
      const omni = sim.creatures.find(c => c.omni)!;
      omni.update(1 / 60, sim);
      const result = renderBrain(canvas, omni, size);
      expect(result!.species).toBe('Omnivore');
      expect(result!.speciesColor).toBe('#ff9933');
    });

    it('includes gen, energy, fitness, age, eaten in stats', () => {
      resetCreatureId();
      const canvas = createCanvas();
      const size: BrainVizSize = { w: 300, h: 220 };
      const sim = new Simulation();
      const creature = sim.creatures[0]!;
      creature.update(1 / 60, sim);
      const result = renderBrain(canvas, creature, size);
      expect(result).toHaveProperty('gen');
      expect(result).toHaveProperty('energy');
      expect(result).toHaveProperty('fitness');
      expect(result).toHaveProperty('age');
      expect(result).toHaveProperty('eaten');
    });

    it('handles sparse activations with missing layers', () => {
      resetCreatureId();
      const canvas = createCanvas();
      const size: BrainVizSize = { w: 300, h: 220 };
      const creature = new Creature(100, 100, 'herb');
      // Set sparse activations - only first and last layers defined
      creature.acts = [];
      creature.acts[0] = new Float64Array(10).fill(0.5);
      creature.acts[3] = new Float64Array(3).fill(0.8);
      // Middle layers are undefined
      const result = renderBrain(canvas, creature, size);
      expect(result).not.toBeNull();
    });

    it('handles activations with missing input and output layers', () => {
      resetCreatureId();
      const canvas = createCanvas();
      const size: BrainVizSize = { w: 300, h: 220 };
      const creature = new Creature(100, 100, 'herb');
      // Set activations with only middle layers (input/output missing)
      creature.acts = [];
      creature.acts[1] = new Float64Array(8).fill(0.3);
      creature.acts[2] = new Float64Array(6).fill(0.4);
      const result = renderBrain(canvas, creature, size);
      expect(result).not.toBeNull();
    });
  });
});
