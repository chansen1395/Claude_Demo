import '@testing-library/jest-dom/vitest';

// Mock canvas context for all tests
function createMockCanvas2DContext(): Record<string, unknown> {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    shadowColor: '',
    shadowBlur: 0,
    globalAlpha: 1,
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
  };
}

HTMLCanvasElement.prototype.getContext = vi.fn(function (this: HTMLCanvasElement) {
  return createMockCanvas2DContext();
}) as unknown as typeof HTMLCanvasElement.prototype.getContext;

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  width: 800,
  height: 600,
  top: 0,
  left: 0,
  bottom: 600,
  right: 800,
  x: 0,
  y: 0,
  toJSON: () => ({}),
}));

// Mock devicePixelRatio
Object.defineProperty(window, 'devicePixelRatio', { value: 1, writable: true });

// Mock requestAnimationFrame / cancelAnimationFrame
let rafId = 0;
window.requestAnimationFrame = vi.fn((cb) => {
  rafId++;
  setTimeout(() => cb(performance.now()), 0);
  return rafId;
});
window.cancelAnimationFrame = vi.fn();

// Mock performance.now
if (!window.performance) {
  Object.defineProperty(window, 'performance', {
    value: { now: vi.fn(() => Date.now()) },
  });
}
