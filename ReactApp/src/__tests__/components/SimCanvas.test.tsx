import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { theme } from '../../theme';
import { SimCanvas } from '../../components/SimCanvas';
import { Simulation } from '../../engine/simulation';
import { resetCreatureId } from '../../engine/creature';
import React from 'react';
import type { SimRendererState } from '../../renderers/simRenderer';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('SimCanvas', () => {
  it('renders a canvas element', () => {
    resetCreatureId();
    const sim = new Simulation();
    const stateRef = { current: null } as React.MutableRefObject<SimRendererState | null>;
    const { container } = renderWithTheme(
      <SimCanvas sim={sim} selected={null} onSelect={vi.fn()} showTrails={true} rendererStateRef={stateRef} />,
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('calls onSelect when canvas is clicked', () => {
    resetCreatureId();
    const sim = new Simulation();
    const onSelect = vi.fn();
    const stateRef = { current: null } as React.MutableRefObject<SimRendererState | null>;
    const { container } = renderWithTheme(
      <SimCanvas sim={sim} selected={null} onSelect={onSelect} showTrails={true} rendererStateRef={stateRef} />,
    );
    const canvas = container.querySelector('canvas')!;
    fireEvent.click(canvas, { clientX: 100, clientY: 100 });
    expect(onSelect).toHaveBeenCalled();
  });

  it('handles double click to add food', () => {
    resetCreatureId();
    const sim = new Simulation();
    const initialFoodCount = sim.food.length;
    const onSelect = vi.fn();
    const stateRef = { current: null } as React.MutableRefObject<SimRendererState | null>;
    const { container } = renderWithTheme(
      <SimCanvas sim={sim} selected={null} onSelect={onSelect} showTrails={true} rendererStateRef={stateRef} />,
    );
    const canvas = container.querySelector('canvas')!;
    fireEvent.doubleClick(canvas, { clientX: 100, clientY: 100 });
    expect(sim.food.length).toBe(initialFoodCount + 1);
  });

  it('sets up renderer state on mount', () => {
    resetCreatureId();
    const sim = new Simulation();
    const stateRef = { current: null } as React.MutableRefObject<SimRendererState | null>;
    renderWithTheme(
      <SimCanvas sim={sim} selected={null} onSelect={vi.fn()} showTrails={true} rendererStateRef={stateRef} />,
    );
    expect(stateRef.current).not.toBeNull();
  });
});
