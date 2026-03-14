import { describe, it, expect } from 'vitest';
import { NN, mutate } from '../../engine/nn';

describe('NN', () => {
  const topo = [3, 4, 2];

  describe('constructor', () => {
    it('creates layers based on topology', () => {
      const nn = new NN(topo);
      expect(nn.topo).toEqual(topo);
      expect(nn.layers).toHaveLength(2);
    });

    it('creates weight arrays of correct size', () => {
      const nn = new NN(topo);
      // Layer 0: 3 inputs -> 4 outputs → 4*3 = 12 weights, 4 biases
      expect(nn.layers[0]!.w.length).toBe(12);
      expect(nn.layers[0]!.b.length).toBe(4);
      // Layer 1: 4 inputs -> 2 outputs → 2*4 = 8 weights, 2 biases
      expect(nn.layers[1]!.w.length).toBe(8);
      expect(nn.layers[1]!.b.length).toBe(2);
    });

    it('initializes with non-zero weights', () => {
      const nn = new NN(topo);
      let hasNonZero = false;
      for (const l of nn.layers) {
        for (let i = 0; i < l.w.length; i++) {
          if (l.w[i] !== 0) { hasNonZero = true; break; }
        }
        if (hasNonZero) break;
      }
      expect(hasNonZero).toBe(true);
    });
  });

  describe('forward', () => {
    it('returns activations for all layers including input', () => {
      const nn = new NN(topo);
      const input = [0.5, -0.3, 0.8];
      const activations = nn.forward(input);
      expect(activations).toHaveLength(3); // input + 2 layers
    });

    it('first activation is the input', () => {
      const nn = new NN(topo);
      const input = [0.5, -0.3, 0.8];
      const activations = nn.forward(input);
      expect(activations[0]![0]).toBeCloseTo(0.5);
      expect(activations[0]![1]).toBeCloseTo(-0.3);
      expect(activations[0]![2]).toBeCloseTo(0.8);
    });

    it('hidden layers use tanh (values in [-1, 1])', () => {
      const nn = new NN(topo);
      const activations = nn.forward([1, 1, 1]);
      const hidden = activations[1]!;
      for (let i = 0; i < hidden.length; i++) {
        expect(hidden[i]!).toBeGreaterThanOrEqual(-1);
        expect(hidden[i]!).toBeLessThanOrEqual(1);
      }
    });

    it('output layer uses sigmoid (values in [0, 1])', () => {
      const nn = new NN(topo);
      const activations = nn.forward([1, 1, 1]);
      const output = activations[2]!;
      for (let i = 0; i < output.length; i++) {
        expect(output[i]!).toBeGreaterThanOrEqual(0);
        expect(output[i]!).toBeLessThanOrEqual(1);
      }
    });

    it('produces correct output size', () => {
      const nn = new NN(topo);
      const activations = nn.forward([1, 1, 1]);
      expect(activations[2]!.length).toBe(2);
    });
  });

  describe('genome / setGenome', () => {
    it('genome returns a flat Float64Array of all weights and biases', () => {
      const nn = new NN(topo);
      const g = nn.genome();
      // 12 + 4 + 8 + 2 = 26
      expect(g.length).toBe(26);
    });

    it('round-trips genome correctly', () => {
      const nn = new NN(topo);
      const original = nn.genome();
      const nn2 = new NN(topo);
      nn2.setGenome(new Float64Array(original));
      const restored = nn2.genome();
      for (let i = 0; i < original.length; i++) {
        expect(restored[i]).toBe(original[i]);
      }
    });
  });

  describe('clone', () => {
    it('creates an independent copy with same genome', () => {
      const nn = new NN(topo);
      const cloned = nn.clone();
      expect(cloned.genome()).toEqual(nn.genome());

      // Verify independence
      cloned.layers[0]!.w[0] = 999;
      expect(nn.layers[0]!.w[0]).not.toBe(999);
    });
  });

  describe('crossover', () => {
    it('produces genome of the same length as parents', () => {
      const a = new NN(topo);
      const b = new NN(topo);
      const child = NN.crossover(a, b);
      expect(child.length).toBe(a.genome().length);
    });

    it('child genes come from one of the two parents', () => {
      const a = new NN(topo);
      const b = new NN(topo);
      const ag = a.genome();
      const bg = b.genome();
      const child = NN.crossover(a, b);
      for (let i = 0; i < child.length; i++) {
        expect([ag[i], bg[i]]).toContain(child[i]);
      }
    });
  });
});

describe('mutate', () => {
  it('returns a Float64Array of same length', () => {
    const genome = new Float64Array([1, 2, 3, 4]);
    const result = mutate(genome, 0.5, 0.4);
    expect(result.length).toBe(genome.length);
  });

  it('does not modify original genome', () => {
    const genome = new Float64Array([1, 2, 3, 4]);
    const copy = new Float64Array(genome);
    mutate(genome, 1.0, 0.4);
    for (let i = 0; i < genome.length; i++) {
      expect(genome[i]).toBe(copy[i]);
    }
  });

  it('with rate=0 returns unchanged genome', () => {
    const genome = new Float64Array([1, 2, 3, 4]);
    const result = mutate(genome, 0, 0.4);
    for (let i = 0; i < genome.length; i++) {
      expect(result[i]).toBe(genome[i]);
    }
  });

  it('with rate=1 mutates genes', () => {
    const genome = new Float64Array(50).fill(0);
    const result = mutate(genome, 1.0, 1.0);
    let changed = 0;
    for (let i = 0; i < result.length; i++) {
      if (result[i] !== 0) changed++;
    }
    expect(changed).toBeGreaterThan(0);
  });
});
