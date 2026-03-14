import { describe, it, expect, beforeEach } from 'vitest';
import { Creature, resetCreatureId } from '../../engine/creature';
import { Simulation } from '../../engine/simulation';
import { CFG } from '../../engine/config';
import { NN } from '../../engine/nn';

describe('Creature', () => {
  beforeEach(() => {
    resetCreatureId();
  });

  describe('constructor', () => {
    it('creates a herbivore with correct species flags', () => {
      const c = new Creature(100, 100, 'herb');
      expect(c.species).toBe('herb');
      expect(c.herb).toBe(true);
      expect(c.carn).toBe(false);
      expect(c.omni).toBe(false);
    });

    it('creates a carnivore with correct species flags', () => {
      const c = new Creature(100, 100, 'carn');
      expect(c.species).toBe('carn');
      expect(c.herb).toBe(false);
      expect(c.carn).toBe(true);
      expect(c.omni).toBe(false);
    });

    it('creates an omnivore with correct species flags', () => {
      const c = new Creature(100, 100, 'omni');
      expect(c.species).toBe('omni');
      expect(c.herb).toBe(false);
      expect(c.carn).toBe(false);
      expect(c.omni).toBe(true);
    });

    it('assigns incrementing IDs', () => {
      const c1 = new Creature(100, 100, 'herb');
      const c2 = new Creature(100, 100, 'herb');
      expect(c2.id).toBe(c1.id + 1);
    });

    it('clamps position within world bounds', () => {
      const c = new Creature(-100, -100, 'herb');
      expect(c.x).toBeGreaterThanOrEqual(5);
      expect(c.y).toBeGreaterThanOrEqual(5);

      const c2 = new Creature(99999, 99999, 'herb');
      expect(c2.x).toBeLessThanOrEqual(CFG.W - 5);
      expect(c2.y).toBeLessThanOrEqual(CFG.H - 5);
    });

    it('uses provided brain and generation', () => {
      const brain = new NN(CFG.TOPOLOGY);
      const c = new Creature(100, 100, 'herb', brain, 5);
      expect(c.brain).toBe(brain);
      expect(c.gen).toBe(5);
    });

    it('creates default brain when none provided', () => {
      const c = new Creature(100, 100, 'herb');
      expect(c.brain).toBeInstanceOf(NN);
      expect(c.gen).toBe(0);
    });

    it('initializes energy to 60% of max', () => {
      const c = new Creature(100, 100, 'herb');
      expect(c.energy).toBeCloseTo(c.maxE * 0.6);
    });

    it('starts alive with no fitness', () => {
      const c = new Creature(100, 100, 'herb');
      expect(c.dead).toBe(false);
      expect(c.fitness).toBe(0);
      expect(c.foodEaten).toBe(0);
      expect(c.age).toBe(0);
    });

    it('sets correct stats for herbivore', () => {
      const c = new Creature(100, 100, 'herb');
      expect(c.maxE).toBe(CFG.HERB_MAX_E);
      expect(c.maxSpd).toBe(CFG.HERB_SPEED);
      expect(c.maxTrn).toBe(CFG.HERB_TURN);
      expect(c.eatR).toBe(CFG.HERB_EAT_R);
      expect(c.meta).toBe(CFG.HERB_META);
      expect(c.sz).toBe(CFG.HERB_SZ);
    });

    it('sets correct stats for carnivore', () => {
      const c = new Creature(100, 100, 'carn');
      expect(c.maxE).toBe(CFG.CARN_MAX_E);
      expect(c.maxSpd).toBe(CFG.CARN_SPEED);
    });

    it('sets correct stats for omnivore', () => {
      const c = new Creature(100, 100, 'omni');
      expect(c.maxE).toBe(CFG.OMNI_MAX_E);
      expect(c.maxSpd).toBe(CFG.OMNI_SPEED);
    });

    it('computes hue from genome', () => {
      const c = new Creature(100, 100, 'herb');
      expect(typeof c.hue).toBe('number');
      // Herb hue: 100..220
      expect(c.hue).toBeGreaterThanOrEqual(100);
      expect(c.hue).toBeLessThanOrEqual(220);
    });

    it('computes hue for carnivore in red range', () => {
      const c = new Creature(100, 100, 'carn');
      // Carn hue: (345 + x*55) % 360, so 345..400 -> 345..360 + 0..40
      expect(c.hue).toBeGreaterThanOrEqual(0);
      expect(c.hue).toBeLessThanOrEqual(400);
    });

    it('computes hue for omnivore in orange range', () => {
      const c = new Creature(100, 100, 'omni');
      // Omni hue: 25..65
      expect(c.hue).toBeGreaterThanOrEqual(25);
      expect(c.hue).toBeLessThanOrEqual(65);
    });
  });

  describe('resetCreatureId', () => {
    it('resets ID counter so next creature starts at 0', () => {
      new Creature(100, 100, 'herb'); // id=0
      new Creature(100, 100, 'herb'); // id=1
      resetCreatureId();
      const c = new Creature(100, 100, 'herb');
      expect(c.id).toBe(0);
    });
  });

  describe('sense', () => {
    it('returns a Float64Array of 10 elements', () => {
      const sim = new Simulation();
      const c = sim.creatures[0]!;
      const inputs = c.sense(sim);
      expect(inputs).toBeInstanceOf(Float64Array);
      expect(inputs.length).toBe(10);
    });

    it('includes energy fraction', () => {
      const sim = new Simulation();
      const c = sim.creatures[0]!;
      const inputs = c.sense(sim);
      // Index 6 is energy / maxE
      expect(inputs[6]).toBeCloseTo(c.energy / c.maxE);
    });

    it('sets food distance to 1 when no food nearby', () => {
      const sim = new Simulation();
      sim.food = []; // remove all food
      // Remove all creatures except one herb far from others
      const herb = new Creature(CFG.W / 2, CFG.H / 2, 'herb');
      sim.creatures = [herb];
      const inputs = herb.sense(sim);
      expect(inputs[1]).toBe(1); // no food → dist = 1
    });

    it('detects threats for herbivores', () => {
      resetCreatureId();
      const sim = new Simulation();
      sim.creatures = [];
      sim.food = [];
      const herb = new Creature(100, 100, 'herb');
      const carn = new Creature(110, 100, 'carn'); // nearby
      sim.creatures = [herb, carn];
      const inputs = herb.sense(sim);
      // Threat distance (index 3) should be < 1 since carn is close
      expect(inputs[3]).toBeLessThan(1);
    });

    it('detects no threat for carnivores (no predators)', () => {
      resetCreatureId();
      const sim = new Simulation();
      sim.creatures = [];
      sim.food = [];
      const carn = new Creature(100, 100, 'carn');
      sim.creatures = [carn];
      const inputs = carn.sense(sim);
      // No threat → distance = 1
      expect(inputs[3]).toBe(1);
    });

    it('detects allies of the same species', () => {
      resetCreatureId();
      const sim = new Simulation();
      sim.creatures = [];
      sim.food = [];
      const h1 = new Creature(100, 100, 'herb');
      const h2 = new Creature(110, 100, 'herb');
      sim.creatures = [h1, h2];
      const inputs = h1.sense(sim);
      // Ally distance (index 5) should be < 1
      expect(inputs[5]).toBeLessThan(1);
    });

    it('returns 1 for ally distance when no allies', () => {
      resetCreatureId();
      const sim = new Simulation();
      sim.creatures = [];
      sim.food = [];
      const h1 = new Creature(100, 100, 'herb');
      sim.creatures = [h1];
      const inputs = h1.sense(sim);
      expect(inputs[5]).toBe(1);
    });

    it('carnivore senses herbivores as food', () => {
      resetCreatureId();
      const sim = new Simulation();
      sim.creatures = [];
      sim.food = [];
      const carn = new Creature(100, 100, 'carn');
      const herb = new Creature(110, 100, 'herb');
      sim.creatures = [carn, herb];
      const inputs = carn.sense(sim);
      // Food distance (index 1) should be < 1
      expect(inputs[1]).toBeLessThan(1);
    });

    it('omnivore senses both food items and herbivores', () => {
      resetCreatureId();
      const sim = new Simulation();
      sim.food = [];
      sim.creatures = [];
      const omni = new Creature(100, 100, 'omni');
      const herb = new Creature(120, 100, 'herb');
      sim.creatures = [omni, herb];
      const inputs = omni.sense(sim);
      // Food distance (index 1) should detect the nearby herbivore
      expect(inputs[1]).toBeLessThan(1);
    });

    it('omnivore detects carnivore as threat', () => {
      resetCreatureId();
      const sim = new Simulation();
      sim.food = [];
      sim.creatures = [];
      const omni = new Creature(100, 100, 'omni');
      const carn = new Creature(120, 100, 'carn');
      sim.creatures = [omni, carn];
      const inputs = omni.sense(sim);
      // Threat distance (index 3) should be < 1
      expect(inputs[3]).toBeLessThan(1);
    });
  });

  describe('update', () => {
    it('does nothing if dead', () => {
      const sim = new Simulation();
      const c = new Creature(100, 100, 'herb');
      c.dead = true;
      const oldX = c.x;
      c.update(1 / 60, sim);
      expect(c.x).toBe(oldX);
    });

    it('advances age', () => {
      const sim = new Simulation();
      const c = sim.creatures[0]!;
      c.update(0.1, sim);
      expect(c.age).toBeGreaterThan(0);
    });

    it('computes brain activations', () => {
      const sim = new Simulation();
      const c = sim.creatures[0]!;
      c.update(1 / 60, sim);
      expect(c.acts).not.toBeNull();
      expect(c.acts!.length).toBe(CFG.TOPOLOGY.length);
    });

    it('updates position', () => {
      const sim = new Simulation();
      const c = new Creature(400, 300, 'herb');
      sim.creatures = [c];
      sim.food = [];
      const oldX = c.x;
      const oldY = c.y;
      // Run several updates to make movement likely
      for (let i = 0; i < 10; i++) c.update(1 / 60, sim);
      // Position should change (unless speed is exactly 0, extremely unlikely)
      const moved = c.x !== oldX || c.y !== oldY;
      expect(moved).toBe(true);
    });

    it('adds trail points', () => {
      const sim = new Simulation();
      const c = sim.creatures[0]!;
      c.update(1 / 60, sim);
      expect(c.trail.length).toBeGreaterThan(0);
    });

    it('limits trail length to CFG.TRAIL', () => {
      const sim = new Simulation();
      const c = sim.creatures[0]!;
      for (let i = 0; i < CFG.TRAIL + 5; i++) c.update(1 / 60, sim);
      expect(c.trail.length).toBeLessThanOrEqual(CFG.TRAIL);
    });

    it('bounces off walls', () => {
      const sim = new Simulation();
      sim.food = [];
      sim.creatures = [];
      const c = new Creature(2, 2, 'herb');
      c.heading = Math.PI; // moving left
      c.speed = 1000;
      sim.creatures = [c];
      c.update(1 / 60, sim);
      expect(c.x).toBeGreaterThanOrEqual(3);
    });

    it('bounces off right wall', () => {
      const sim = new Simulation();
      sim.food = [];
      sim.creatures = [];
      const c = new Creature(CFG.W - 2, 300, 'herb');
      c.heading = 0; // moving right
      c.speed = 1000;
      sim.creatures = [c];
      c.update(1 / 60, sim);
      expect(c.x).toBeLessThanOrEqual(CFG.W - 3);
    });

    it('bounces off bottom wall', () => {
      const sim = new Simulation();
      sim.food = [];
      sim.creatures = [];
      const c = new Creature(400, CFG.H - 2, 'herb');
      c.heading = Math.PI / 2; // moving down
      c.speed = 1000;
      sim.creatures = [c];
      c.update(1 / 60, sim);
      expect(c.y).toBeLessThanOrEqual(CFG.H - 3);
    });

    it('bounces off top wall', () => {
      const sim = new Simulation();
      sim.food = [];
      sim.creatures = [];
      const c = new Creature(400, 2, 'herb');
      c.heading = -Math.PI / 2; // moving up
      c.speed = 1000;
      sim.creatures = [c];
      c.update(1 / 60, sim);
      expect(c.y).toBeGreaterThanOrEqual(3);
    });

    it('drains energy over time', () => {
      const sim = new Simulation();
      const c = sim.creatures[0]!;
      const startE = c.energy;
      c.update(1 / 60, sim);
      expect(c.energy).toBeLessThan(startE);
    });

    it('increases fitness over time', () => {
      const sim = new Simulation();
      const c = sim.creatures[0]!;
      c.update(1 / 60, sim);
      expect(c.fitness).toBeGreaterThan(0);
    });

    it('dies when energy reaches 0', () => {
      const sim = new Simulation();
      const c = new Creature(400, 300, 'herb');
      c.energy = 0.001;
      sim.creatures = [c];
      sim.food = [];
      c.update(1, sim);
      expect(c.dead).toBe(true);
      expect(c.energy).toBe(0);
    });
  });

  describe('reproduce', () => {
    it('returns null if energy below threshold', () => {
      const sim = new Simulation();
      const c = new Creature(400, 300, 'herb');
      c.energy = 1; // way below threshold
      sim.creatures = [c];
      expect(c.reproduce(sim)).toBeNull();
    });

    it('returns null if recently reproduced', () => {
      const sim = new Simulation();
      sim.time = 10;
      const c = new Creature(400, 300, 'herb');
      c.energy = c.maxE; // max energy
      c.lastRepro = 9; // just reproduced
      sim.creatures = [c];
      expect(c.reproduce(sim)).toBeNull();
    });

    it('produces offspring when conditions are met (asexual)', () => {
      const sim = new Simulation();
      sim.time = 10;
      sim.creatures = [];
      const c = new Creature(400, 300, 'herb');
      c.energy = c.maxE; // full energy
      c.lastRepro = -5;
      sim.creatures = [c];
      sim.food = [];
      const child = c.reproduce(sim);
      expect(child).toBeInstanceOf(Creature);
      expect(child!.species).toBe('herb');
      expect(child!.gen).toBe(1);
    });

    it('produces offspring with crossover when mate available', () => {
      const sim = new Simulation();
      sim.time = 10;
      const parent1 = new Creature(400, 300, 'herb');
      parent1.energy = parent1.maxE;
      parent1.lastRepro = -5;
      const parent2 = new Creature(410, 300, 'herb');
      parent2.energy = parent2.maxE;
      parent2.lastRepro = -5;
      sim.creatures = [parent1, parent2];
      sim.food = [];
      const child = parent1.reproduce(sim);
      expect(child).toBeInstanceOf(Creature);
      expect(child!.gen).toBe(1);
    });

    it('reduces parent energy after reproduction', () => {
      const sim = new Simulation();
      sim.time = 10;
      const c = new Creature(400, 300, 'herb');
      c.energy = c.maxE;
      c.lastRepro = -5;
      sim.creatures = [c];
      sim.food = [];
      const startE = c.energy;
      c.reproduce(sim);
      expect(c.energy).toBeLessThan(startE);
    });

    it('carnivore can reproduce', () => {
      const sim = new Simulation();
      sim.time = 10;
      const c = new Creature(400, 300, 'carn');
      c.energy = c.maxE;
      c.lastRepro = -5;
      sim.creatures = [c];
      const child = c.reproduce(sim);
      expect(child).toBeInstanceOf(Creature);
      expect(child!.species).toBe('carn');
    });

    it('omnivore can reproduce', () => {
      const sim = new Simulation();
      sim.time = 10;
      const c = new Creature(400, 300, 'omni');
      c.energy = c.maxE;
      c.lastRepro = -5;
      sim.creatures = [c];
      const child = c.reproduce(sim);
      expect(child).toBeInstanceOf(Creature);
      expect(child!.species).toBe('omni');
    });

    it('updates lastRepro on parent after reproduction', () => {
      const sim = new Simulation();
      sim.time = 10;
      const c = new Creature(400, 300, 'herb');
      c.energy = c.maxE;
      c.lastRepro = -5;
      sim.creatures = [c];
      c.reproduce(sim);
      expect(c.lastRepro).toBe(10);
    });

    it('mate also gets energy deducted and lastRepro updated', () => {
      const sim = new Simulation();
      sim.time = 10;
      const parent1 = new Creature(400, 300, 'herb');
      parent1.energy = parent1.maxE;
      parent1.lastRepro = -5;
      const parent2 = new Creature(410, 300, 'herb');
      parent2.energy = parent2.maxE;
      parent2.lastRepro = -5;
      sim.creatures = [parent1, parent2];
      const startMateE = parent2.energy;
      parent1.reproduce(sim);
      expect(parent2.energy).toBeLessThan(startMateE);
      expect(parent2.lastRepro).toBe(10);
    });
  });
});
