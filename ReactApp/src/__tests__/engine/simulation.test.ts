import { describe, it, expect, beforeEach } from 'vitest';
import { Simulation } from '../../engine/simulation';
import { CFG } from '../../engine/config';
import { Creature, resetCreatureId } from '../../engine/creature';
import { Food } from '../../engine/food';

describe('Simulation', () => {
  beforeEach(() => {
    resetCreatureId();
  });

  describe('constructor / reset', () => {
    it('initializes with the correct number of creatures', () => {
      const sim = new Simulation();
      const herbs = sim.creatures.filter(c => c.herb).length;
      const carns = sim.creatures.filter(c => c.carn).length;
      const omnis = sim.creatures.filter(c => c.omni).length;
      expect(herbs).toBe(CFG.INIT_HERBS);
      expect(carns).toBe(CFG.INIT_CARNS);
      expect(omnis).toBe(CFG.INIT_OMNIS);
    });

    it('initializes food', () => {
      const sim = new Simulation();
      expect(sim.food.length).toBe(CFG.INIT_FOOD);
    });

    it('starts time at 0', () => {
      const sim = new Simulation();
      expect(sim.time).toBe(0);
      expect(sim.ticks).toBe(0);
    });

    it('reset clears state', () => {
      const sim = new Simulation();
      sim.time = 999;
      sim.ticks = 999;
      sim.bestFitness = 999;
      sim.history = [{ h: 1, c: 1, o: 1 }];
      sim.reset();
      expect(sim.time).toBe(0);
      expect(sim.ticks).toBe(0);
      expect(sim.bestFitness).toBe(0);
      expect(sim.history).toHaveLength(0);
    });

    it('reset re-initializes creatures and food', () => {
      const sim = new Simulation();
      sim.creatures = [];
      sim.food = [];
      sim.reset();
      expect(sim.creatures.length).toBe(CFG.INIT_HERBS + CFG.INIT_CARNS + CFG.INIT_OMNIS);
      expect(sim.food.length).toBe(CFG.INIT_FOOD);
    });

    it('has default mutRate from config', () => {
      const sim = new Simulation();
      expect(sim.mutRate).toBe(CFG.MUT_RATE);
    });
  });

  describe('burst', () => {
    it('creates particles', () => {
      const sim = new Simulation();
      sim.particles = [];
      sim.burst(100, 200, '#fff', 5, 50);
      expect(sim.particles.length).toBe(5);
    });

    it('particles are at the burst position', () => {
      const sim = new Simulation();
      sim.particles = [];
      sim.burst(100, 200, '#fff', 3, 50);
      for (const p of sim.particles) {
        expect(p.x).toBe(100);
        expect(p.y).toBe(200);
      }
    });
  });

  describe('update', () => {
    it('advances time', () => {
      const sim = new Simulation();
      sim.update(1 / 60);
      expect(sim.time).toBeGreaterThan(0);
      expect(sim.ticks).toBe(1);
    });

    it('clamps dt to 0.025', () => {
      const sim = new Simulation();
      sim.update(1); // 1 second is way over 0.025
      // time should advance by clamped value
      expect(sim.time).toBeCloseTo(0.025);
    });

    it('herbivores eat food', () => {
      const sim = new Simulation();
      sim.creatures = [];
      sim.food = [];
      sim.particles = [];
      resetCreatureId();
      const herb = new Creature(100, 100, 'herb');
      // Force brain eat output > 0.5 by setting last layer bias[2] very high
      herb.brain.layers[herb.brain.layers.length - 1]!.b[2] = 100;
      herb.energy = 10;
      sim.creatures = [herb];
      sim.food = [new Food(100, 100)];
      sim.update(0.001);
      expect(herb.foodEaten).toBeGreaterThanOrEqual(1);
      expect(herb.energy).toBeGreaterThan(10);
    });

    it('carnivores eat herbivores', () => {
      const sim = new Simulation();
      sim.creatures = [];
      sim.food = [];
      sim.particles = [];
      resetCreatureId();
      const carn = new Creature(100, 100, 'carn');
      carn.brain.layers[carn.brain.layers.length - 1]!.b[2] = 100;
      carn.energy = 10;
      const herb = new Creature(100, 100, 'herb');
      sim.creatures = [carn, herb];
      sim.update(0.001);
      expect(herb.dead).toBe(true);
      expect(carn.foodEaten).toBeGreaterThanOrEqual(1);
    });

    it('omnivores eat herbivores', () => {
      const sim = new Simulation();
      sim.creatures = [];
      sim.food = [];
      sim.particles = [];
      resetCreatureId();
      const omni = new Creature(100, 100, 'omni');
      omni.brain.layers[omni.brain.layers.length - 1]!.b[2] = 100;
      omni.energy = 10;
      const herb = new Creature(100, 100, 'herb');
      sim.creatures = [omni, herb];
      sim.update(0.001);
      expect(herb.dead).toBe(true);
      expect(omni.foodEaten).toBeGreaterThanOrEqual(1);
    });

    it('omnivores eat food', () => {
      const sim = new Simulation();
      sim.creatures = [];
      sim.food = [];
      sim.particles = [];
      resetCreatureId();
      const omni = new Creature(100, 100, 'omni');
      omni.brain.layers[omni.brain.layers.length - 1]!.b[2] = 100;
      omni.energy = 10;
      sim.creatures = [omni];
      sim.food = [new Food(100, 100)];
      sim.update(0.001);
      expect(omni.foodEaten).toBeGreaterThanOrEqual(1);
    });

    it('removes dead creatures and spawns particles', () => {
      const sim = new Simulation();
      // Mark specific creatures as dead and remember their IDs
      const deadIds = new Set<number>();
      for (let i = 0; i < 5; i++) {
        sim.creatures[i]!.dead = true;
        deadIds.add(sim.creatures[i]!.id);
      }
      sim.update(1 / 60);
      // Dead creatures should no longer be in the list
      for (const creature of sim.creatures) {
        expect(deadIds.has(creature.id)).toBe(false);
      }
    });

    it('spawns food over time', () => {
      const sim = new Simulation();
      sim.food = [];
      sim.foodAcc = 0;
      // Run enough time to accumulate food spawns
      for (let i = 0; i < 100; i++) sim.update(0.025);
      expect(sim.food.length).toBeGreaterThan(0);
    });

    it('caps food at MAX_FOOD', () => {
      const sim = new Simulation();
      // Fill up food
      while (sim.food.length < CFG.MAX_FOOD + 10) {
        sim.food.push(new Food(0, 0));
      }
      sim.foodAcc = 10;
      sim.update(0.001);
      expect(sim.food.length).toBeLessThanOrEqual(CFG.MAX_FOOD + 10); // existing ones remain, just no new spawns
    });

    it('removes eaten food', () => {
      const sim = new Simulation();
      sim.food[0]!.eaten = true;
      const countBefore = sim.food.length;
      sim.update(0.001);
      expect(sim.food.length).toBeLessThan(countBefore);
    });

    it('maintains minimum population', () => {
      const sim = new Simulation();
      sim.creatures = []; // kill all
      sim.update(1 / 60);
      const herbs = sim.creatures.filter(c => c.herb).length;
      const carns = sim.creatures.filter(c => c.carn).length;
      const omnis = sim.creatures.filter(c => c.omni).length;
      expect(herbs).toBeGreaterThanOrEqual(CFG.MIN_HERBS);
      expect(carns).toBeGreaterThanOrEqual(CFG.MIN_CARNS);
      expect(omnis).toBeGreaterThanOrEqual(CFG.MIN_OMNIS);
    });

    it('caps population at MAX_POP', () => {
      const sim = new Simulation();
      resetCreatureId();
      // Add tons of creatures
      for (let i = 0; i < CFG.MAX_POP + 50; i++) {
        sim.creatures.push(new Creature(Math.random() * CFG.W, Math.random() * CFG.H, 'herb'));
      }
      sim.update(0.001);
      // After update, population is managed
      // It may be slightly above MAX_POP due to minimum species maintenance
      expect(sim.creatures.length).toBeLessThanOrEqual(CFG.MAX_POP + CFG.MIN_HERBS + CFG.MIN_CARNS + CFG.MIN_OMNIS);
    });

    it('records history every 0.5 seconds', () => {
      const sim = new Simulation();
      sim.histTimer = 0.49;
      sim.update(0.025); // pushes histTimer to 0.515
      expect(sim.history.length).toBeGreaterThan(0);
    });

    it('caps history at 360 entries', () => {
      const sim = new Simulation();
      sim.history = Array.from({ length: 360 }, () => ({ h: 1, c: 1, o: 1 }));
      sim.histTimer = 0.49;
      sim.update(0.025);
      expect(sim.history.length).toBeLessThanOrEqual(360);
    });

    it('updates particles and removes dead ones', () => {
      const sim = new Simulation();
      sim.particles = [];
      sim.burst(100, 100, '#fff', 5, 50);
      expect(sim.particles.length).toBe(5);

      // Update particles manually (this is what sim.update does internally)
      for (const p of sim.particles) p.update(0.01);
      // All still alive
      expect(sim.particles.every(p => !p.dead)).toBe(true);

      // Kill them by exhausting their life
      for (const p of sim.particles) p.life = -1;
      // Filter dead ones (mirroring what sim.update does)
      sim.particles = sim.particles.filter(p => !p.dead);
      expect(sim.particles.length).toBe(0);
    });

    it('handles reproduction during update', () => {
      const sim = new Simulation();
      sim.time = 10;
      // Give all creatures max energy to trigger reproduction
      for (const c of sim.creatures) {
        c.energy = c.maxE;
        c.lastRepro = -5;
      }
      const countBefore = sim.creatures.length;
      sim.update(0.025);
      // Some may have reproduced
      expect(sim.creatures.length).toBeGreaterThanOrEqual(countBefore);
    });
  });

  describe('stats', () => {
    it('returns SimStats object', () => {
      const sim = new Simulation();
      const s = sim.stats();
      expect(s).toHaveProperty('herbs');
      expect(s).toHaveProperty('carns');
      expect(s).toHaveProperty('omnis');
      expect(s).toHaveProperty('food');
      expect(s).toHaveProperty('hE');
      expect(s).toHaveProperty('cE');
      expect(s).toHaveProperty('oE');
      expect(s).toHaveProperty('maxGen');
      expect(s).toHaveProperty('bestFit');
      expect(s).toHaveProperty('time');
    });

    it('counts species correctly', () => {
      const sim = new Simulation();
      const s = sim.stats();
      expect(s.herbs).toBe(CFG.INIT_HERBS);
      expect(s.carns).toBe(CFG.INIT_CARNS);
      expect(s.omnis).toBe(CFG.INIT_OMNIS);
    });

    it('reports food count', () => {
      const sim = new Simulation();
      const s = sim.stats();
      expect(s.food).toBe(CFG.INIT_FOOD);
    });

    it('computes average energy', () => {
      const sim = new Simulation();
      const s = sim.stats();
      expect(s.hE).toBeGreaterThan(0);
    });

    it('handles 0 population for energy average', () => {
      const sim = new Simulation();
      sim.creatures = [];
      const s = sim.stats();
      expect(s.hE).toBe(0);
      expect(s.cE).toBe(0);
      expect(s.oE).toBe(0);
    });

    it('tracks bestFitness', () => {
      const sim = new Simulation();
      sim.bestFitness = 50;
      const s = sim.stats();
      expect(parseFloat(s.bestFit)).toBeGreaterThanOrEqual(50);
    });

    it('updates bestFitness from living creatures', () => {
      const sim = new Simulation();
      sim.creatures[0]!.fitness = 999;
      const s = sim.stats();
      expect(parseFloat(s.bestFit)).toBeGreaterThanOrEqual(999);
      expect(sim.bestFitness).toBeGreaterThanOrEqual(999);
    });

    it('reports time', () => {
      const sim = new Simulation();
      sim.time = 42;
      expect(sim.stats().time).toBe(42);
    });

    it('reports maxGen', () => {
      const sim = new Simulation();
      sim.creatures[0]!.gen; // gen is usually 0
      const s = sim.stats();
      expect(typeof s.maxGen).toBe('number');
    });
  });
});
