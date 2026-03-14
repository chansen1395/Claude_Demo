import { describe, it, expect } from 'vitest';
import { setupGraphCanvas, renderGraph, type GraphSize } from '../../renderers/graphRenderer';
import type { HistoryEntry } from '../../engine/types';

describe('graphRenderer', () => {
  function createCanvas(): HTMLCanvasElement {
    return document.createElement('canvas');
  }

  describe('setupGraphCanvas', () => {
    it('returns size object', () => {
      const canvas = createCanvas();
      const size = setupGraphCanvas(canvas);
      expect(size).toHaveProperty('w');
      expect(size).toHaveProperty('h');
    });

    it('falls back to dpr=1 when devicePixelRatio is 0', () => {
      const origDpr = window.devicePixelRatio;
      Object.defineProperty(window, 'devicePixelRatio', { value: 0, writable: true, configurable: true });
      const canvas = createCanvas();
      const size = setupGraphCanvas(canvas);
      Object.defineProperty(window, 'devicePixelRatio', { value: origDpr, writable: true, configurable: true });
      expect(size.w).toBeGreaterThan(0);
    });
  });

  describe('renderGraph', () => {
    it('renders placeholder when history has < 2 entries', () => {
      const canvas = createCanvas();
      const size: GraphSize = { w: 300, h: 140 };
      expect(() => renderGraph(canvas, [], size)).not.toThrow();
      expect(() => renderGraph(canvas, [{ h: 10, c: 5, o: 3 }], size)).not.toThrow();
    });

    it('renders graph with history data', () => {
      const canvas = createCanvas();
      const size: GraphSize = { w: 300, h: 140 };
      const history: HistoryEntry[] = [
        { h: 10, c: 5, o: 3 },
        { h: 12, c: 4, o: 5 },
        { h: 15, c: 6, o: 4 },
      ];
      expect(() => renderGraph(canvas, history, size)).not.toThrow();
    });

    it('handles large history', () => {
      const canvas = createCanvas();
      const size: GraphSize = { w: 300, h: 140 };
      const history: HistoryEntry[] = Array.from({ length: 360 }, (_, i) => ({
        h: 10 + i % 20,
        c: 5 + i % 10,
        o: 3 + i % 8,
      }));
      expect(() => renderGraph(canvas, history, size)).not.toThrow();
    });
  });
});
