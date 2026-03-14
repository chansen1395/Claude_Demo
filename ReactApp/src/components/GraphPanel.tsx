import { useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import type { HistoryEntry } from '../engine/types';
import { setupGraphCanvas, renderGraph, type GraphSize } from '../renderers/graphRenderer';

const PanelWrapper = styled.div`
  background: linear-gradient(135deg, rgba(17, 17, 40, 0.92), rgba(25, 25, 55, 0.85));
  border: 1px solid ${p => p.theme.colors.borderPanel};
  border-radius: 6px;
  padding: 0.7rem;
  backdrop-filter: blur(8px);
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
  height: 140px;
  background: #080818;
  border: 1px solid ${p => p.theme.colors.borderGraph};
  border-radius: 4px;
`;

interface GraphPanelProps {
  history: HistoryEntry[];
  graphSizeRef: React.MutableRefObject<GraphSize | null>;
}

export function GraphPanel({ history, graphSizeRef }: GraphPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    graphSizeRef.current = setupGraphCanvas(canvas);
  }, [graphSizeRef]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !graphSizeRef.current) return;
    renderGraph(canvas, history, graphSizeRef.current);
  });

  return (
    <PanelWrapper>
      <PanelTitle>Population Dynamics</PanelTitle>
      <Canvas ref={canvasRef} />
    </PanelWrapper>
  );
}
