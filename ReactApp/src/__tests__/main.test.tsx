import { describe, it, expect, vi } from 'vitest';

// Mock the heavy App component to avoid memory issues
vi.mock('../App', () => ({
  App: () => null,
}));

vi.mock('react-dom/client', () => {
  const renderFn = vi.fn();
  return {
    createRoot: vi.fn(() => ({
      render: renderFn,
    })),
  };
});

describe('main', () => {
  it('calls createRoot with the root element', async () => {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);

    const { createRoot } = await import('react-dom/client');
    await import('../main');

    expect(createRoot).toHaveBeenCalledWith(root);

    document.body.removeChild(root);
  });
});
