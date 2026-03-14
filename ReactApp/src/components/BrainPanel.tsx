import { useRef, useEffect, useCallback, useState } from 'react';
import styled from 'styled-components';
import type { Creature } from '../engine/creature';
import { setupBrainCanvas, renderBrain, type BrainVizSize, type BrainStatValues } from '../renderers/brainRenderer';

const PanelWrapper = styled.div`
  background: linear-gradient(135deg, rgba(17, 17, 40, 0.92), rgba(25, 25, 55, 0.85));
  border: 1px solid ${p => p.theme.colors.borderPanel};
  border-radius: 6px;
  padding: 0.7rem;
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
`;

const PanelTitle = styled.h3`
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: ${p => p.theme.colors.accentBlue};
  margin-bottom: 0.5rem;
  opacity: 0.8;
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 220px;
  background: #080818;
  border: 1px solid ${p => p.theme.colors.borderBrain};
  border-radius: 4px;
  margin-bottom: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-family: ${p => p.theme.fonts.mono};
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0.4rem;
  background: ${p => p.theme.colors.statBg};
  border-radius: 3px;
  border-left: 2px solid rgba(0, 255, 136, 0.3);
`;

const StatLabel = styled.span`
  color: ${p => p.theme.colors.textLabel};
`;

const StatValue = styled.span<{ $color?: string }>`
  color: ${p => p.$color ?? p.theme.colors.accent};
  font-weight: 600;
`;

interface BrainPanelProps {
  creature: Creature | null;
  brainSizeRef: React.MutableRefObject<BrainVizSize | null>;
}

const DEFAULT_STATS: BrainStatValues = {
  species: '—',
  speciesColor: '#00ff88',
  gen: '—',
  energy: '—',
  fitness: '—',
  age: '—',
  eaten: '—',
};

export function BrainPanel({ creature, brainSizeRef }: BrainPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState<BrainStatValues>(DEFAULT_STATS);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    brainSizeRef.current = setupBrainCanvas(canvas);
  }, [brainSizeRef]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Render brain each frame (called by parent via effect)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !brainSizeRef.current) return;
    const result = renderBrain(canvas, creature, brainSizeRef.current);
    if (result) {
      setStats(result);
    } else if (!creature) {
      setStats(DEFAULT_STATS);
    }
  });

  return (
    <PanelWrapper>
      <PanelTitle>Neural Network</PanelTitle>
      <Canvas ref={canvasRef} />
      <StatsGrid>
        <StatItem>
          <StatLabel>Species</StatLabel>
          <StatValue $color={stats.speciesColor}>{stats.species}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Gen</StatLabel>
          <StatValue>{stats.gen}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Energy</StatLabel>
          <StatValue>{stats.energy}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Fitness</StatLabel>
          <StatValue>{stats.fitness}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Age</StatLabel>
          <StatValue>{stats.age}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Eaten</StatLabel>
          <StatValue>{stats.eaten}</StatValue>
        </StatItem>
      </StatsGrid>
    </PanelWrapper>
  );
}
