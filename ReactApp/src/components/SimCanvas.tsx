import { useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { CFG } from '../engine/config';
import type { Creature } from '../engine/creature';
import type { Simulation } from '../engine/simulation';
import { Food } from '../engine/food';
import { hsl } from '../engine/utils';
import { setupSimCanvas, renderSim, type SimRendererState } from '../renderers/simRenderer';

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  background: #0a0a1a;
  border: 1.5px solid rgba(0, 255, 136, 0.25);
  border-radius: 6px;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.15), inset 0 0 15px rgba(0, 255, 136, 0.03);
  cursor: crosshair;
`;

interface SimCanvasProps {
  sim: Simulation;
  selected: Creature | null;
  onSelect: (creature: Creature | null) => void;
  showTrails: boolean;
  rendererStateRef: React.MutableRefObject<SimRendererState | null>;
}

export function SimCanvas({ sim, selected, onSelect, showTrails, rendererStateRef }: SimCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    rendererStateRef.current = setupSimCanvas(canvas);
  }, [rendererStateRef]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Expose render method via ref pattern
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !rendererStateRef.current) return;
    renderSim(canvas, sim, selected, showTrails, rendererStateRef.current);
  });

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const worldX = (e.clientX - rect.left) / rect.width * CFG.W;
    const worldY = (e.clientY - rect.top) / rect.height * CFG.H;
    let nearestCreature: Creature | null = null;
    let nearestDistance = 30;
    for (const creature of sim.creatures) {
      const clickDistance = Math.hypot(creature.x - worldX, creature.y - worldY);
      if (clickDistance < nearestDistance) { nearestDistance = clickDistance; nearestCreature = creature; }
    }
    onSelect(nearestCreature);
  }, [sim, onSelect]);

  const handleDblClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const foodX = (e.clientX - rect.left) / rect.width * CFG.W;
    const foodY = (e.clientY - rect.top) / rect.height * CFG.H;
    sim.food.push(new Food(foodX, foodY));
    sim.burst(foodX, foodY, hsl(120, 100, 70), 4, 50);
  }, [sim]);

  return (
    <Canvas
      ref={canvasRef}
      onClick={handleClick}
      onDoubleClick={handleDblClick}
    />
  );
}
