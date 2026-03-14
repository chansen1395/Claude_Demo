import { useState, useRef, useCallback, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { theme } from './theme';
import { Simulation } from './engine/simulation';
import type { Creature } from './engine/creature';
import type { SimStats } from './engine/types';
import type { SimRendererState } from './renderers/simRenderer';
import type { BrainVizSize } from './renderers/brainRenderer';
import type { GraphSize } from './renderers/graphRenderer';
import { Header } from './components/Header';
import { SimCanvas } from './components/SimCanvas';
import { BrainPanel } from './components/BrainPanel';
import { StatsPanel } from './components/StatsPanel';
import { GraphPanel } from './components/GraphPanel';
import { Controls } from './components/Controls';

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${p => p.theme.fonts.body};
    background: linear-gradient(135deg, ${p => p.theme.colors.bgGradientStart} 0%, ${p => p.theme.colors.bgGradientEnd} 100%);
    color: ${p => p.theme.colors.text};
    overflow: hidden;
    height: 100vh;
  }

  #root {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: rgba(0,255,136,0.03); }
  ::-webkit-scrollbar-thumb { background: rgba(0,255,136,0.2); border-radius: 3px; }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  overflow: hidden;
  min-height: 0;

  @media (max-width: 1100px) {
    flex-direction: column;
  }
`;

const SimPanel = styled.div`
  flex: 1;
  display: flex;
  min-width: 0;
`;

const InfoPanel = styled.div`
  width: 370px;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  overflow: hidden;
  flex-shrink: 0;

  @media (max-width: 1100px) {
    width: 100%;
    flex-direction: row;
    height: 260px;

    & > * {
      flex: 1;
      min-width: 0;
    }
  }

  @media (max-width: 700px) {
    flex-direction: column;
    height: auto;
  }
`;

const FIXED_TIMESTEP = 1 / 60;

const EMPTY_STATS: SimStats = {
  herbs: 0, carns: 0, omnis: 0, food: 0,
  hE: 0, cE: 0, oE: 0,
  maxGen: 0, bestFit: '0', time: 0,
};

export function App() {
  const simRef = useRef<Simulation>(new Simulation());
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [trails, setTrails] = useState(true);
  const [selected, setSelected] = useState<Creature | null>(null);
  const [stats, setStats] = useState<SimStats>(EMPTY_STATS);

  const simRendererRef = useRef<SimRendererState | null>(null);
  const brainSizeRef = useRef<BrainVizSize | null>(null);
  const graphSizeRef = useRef<GraphSize | null>(null);

  const pausedRef = useRef(paused);
  const speedRef = useRef(speed);
  const selectedRef = useRef(selected);
  pausedRef.current = paused;
  speedRef.current = speed;
  selectedRef.current = selected;

  // Track stats update timing
  const lastStatsRef = useRef(0);
  // Force re-render trigger for canvas drawing
  const [, setTick] = useState(0);

  useEffect(() => {
    let animationFrameId: number;

    const frame = () => {
      const sim = simRef.current;

      if (!pausedRef.current) {
        const steps = speedRef.current;
        for (let stepIndex = 0; stepIndex < steps; stepIndex++) sim.update(FIXED_TIMESTEP);
      }

      // Deselect dead creatures
      if (selectedRef.current?.dead) {
        setSelected(null);
      }

      // Update stats periodically
      const now = performance.now();
      if (now - lastStatsRef.current > 200) {
        lastStatsRef.current = now;
        setStats(sim.stats());
      }

      // Trigger re-render for canvas drawing
      setTick(t => t + 1);
      animationFrameId = requestAnimationFrame(frame);
    };

    animationFrameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setPaused(previousPaused => !previousPaused);
      }
      if (e.key === '+' || e.key === '=') {
        setSpeed(previousSpeed => Math.min(10, previousSpeed + 1));
      }
      if (e.key === '-') {
        setSpeed(previousSpeed => Math.max(1, previousSpeed - 1));
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Sync mutation rate
  const handleMutRateChange = useCallback((rate: number) => {
    simRef.current.mutRate = rate;
  }, []);

  const handleReset = useCallback(() => {
    simRef.current.reset();
    setSelected(null);
    setStats(EMPTY_STATS);
  }, []);

  const handleTogglePause = useCallback(() => setPaused(previousPaused => !previousPaused), []);
  const handleToggleTrails = useCallback(() => setTrails(previousTrails => !previousTrails), []);

  const sim = simRef.current;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Header />
      <Main>
        <SimPanel>
          <SimCanvas
            sim={sim}
            selected={selected}
            onSelect={setSelected}
            showTrails={trails}
            rendererStateRef={simRendererRef}
          />
        </SimPanel>
        <InfoPanel>
          <BrainPanel creature={selected} brainSizeRef={brainSizeRef} />
          <StatsPanel stats={stats} />
          <GraphPanel history={sim.history} graphSizeRef={graphSizeRef} />
        </InfoPanel>
      </Main>
      <Controls
        paused={paused}
        speed={speed}
        mutRate={sim.mutRate}
        trails={trails}
        onTogglePause={handleTogglePause}
        onSpeedChange={setSpeed}
        onMutRateChange={handleMutRateChange}
        onToggleTrails={handleToggleTrails}
        onReset={handleReset}
      />
    </ThemeProvider>
  );
}
