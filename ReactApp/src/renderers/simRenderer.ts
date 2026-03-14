import { CFG } from '../engine/config';
import type { Creature } from '../engine/creature';
import type { Simulation } from '../engine/simulation';
import { TAU, clamp, hsl } from '../engine/utils';

export interface SimRendererState {
  w: number;
  h: number;
  sx: number;
  sy: number;
}

export function setupSimCanvas(canvas: HTMLCanvasElement): SimRendererState {
  const canvasBounds = canvas.parentElement!.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvasBounds.width * dpr;
  canvas.height = canvasBounds.height * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return {
    w: canvasBounds.width,
    h: canvasBounds.height,
    sx: canvasBounds.width / CFG.W,
    sy: canvasBounds.height / CFG.H,
  };
}

function worldToCanvasX(worldX: number, scaleX: number): number { return worldX * scaleX; }
function worldToCanvasY(worldY: number, scaleY: number): number { return worldY * scaleY; }
function worldToCanvasSize(worldSize: number, scaleX: number, scaleY: number): number { return worldSize * Math.min(scaleX, scaleY); }

export function renderSim(
  canvas: HTMLCanvasElement,
  sim: Simulation,
  selected: Creature | null,
  showTrails: boolean,
  state: SimRendererState,
): void {
  const ctx = canvas.getContext('2d')!;
  const { w: canvasWidth, h: canvasHeight, sx: scaleX, sy: scaleY } = state;
  ctx.fillStyle = '#08081a';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Grid
  ctx.strokeStyle = 'rgba(0,255,136,0.04)';
  ctx.lineWidth = 1;
  const gridSizeX = 50 * scaleX;
  for (let gridX = gridSizeX; gridX < canvasWidth; gridX += gridSizeX) {
    ctx.beginPath();
    ctx.moveTo(gridX, 0);
    ctx.lineTo(gridX, canvasHeight);
    ctx.stroke();
  }
  const gridSizeY = 50 * scaleY;
  for (let gridY = gridSizeY; gridY < canvasHeight; gridY += gridSizeY) {
    ctx.beginPath();
    ctx.moveTo(0, gridY);
    ctx.lineTo(canvasWidth, gridY);
    ctx.stroke();
  }

  // Food
  ctx.save();
  for (const foodItem of sim.food) {
    const foodCanvasX = worldToCanvasX(foodItem.x, scaleX);
    const foodCanvasY = worldToCanvasY(foodItem.y, scaleY);
    const foodRadius = worldToCanvasSize(3.5 * foodItem.pulse, scaleX, scaleY);
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = worldToCanvasSize(12, scaleX, scaleY);
    ctx.fillStyle = 'rgba(0,255,136,0.2)';
    ctx.beginPath(); ctx.arc(foodCanvasX, foodCanvasY, foodRadius * 1.8, 0, TAU); ctx.fill();
    ctx.fillStyle = '#00ff88';
    ctx.beginPath(); ctx.arc(foodCanvasX, foodCanvasY, foodRadius, 0, TAU); ctx.fill();
  }
  ctx.restore();

  // Trails
  if (showTrails) {
    for (const creature of sim.creatures) {
      const trailPoints = creature.trail;
      for (let trailIndex = 0; trailIndex < trailPoints.length; trailIndex++) {
        const trailAlpha = (trailIndex / trailPoints.length) * 0.35;
        ctx.fillStyle = hsl(creature.hue, 80, 50, trailAlpha);
        ctx.fillRect(
          worldToCanvasX(trailPoints[trailIndex]!.x, scaleX) - 1,
          worldToCanvasY(trailPoints[trailIndex]!.y, scaleY) - 1,
          2,
          2,
        );
      }
    }
  }

  // Creatures
  for (const creature of sim.creatures) {
    const creatureCanvasX = worldToCanvasX(creature.x, scaleX);
    const creatureCanvasY = worldToCanvasY(creature.y, scaleY);
    const creatureSize = worldToCanvasSize(creature.sz * (0.6 + (creature.energy / creature.maxE) * 0.5), scaleX, scaleY);

    // Glow
    ctx.fillStyle = hsl(creature.hue, 90, 50, 0.15);
    ctx.beginPath(); ctx.arc(creatureCanvasX, creatureCanvasY, creatureSize * 2.2, 0, TAU); ctx.fill();

    // Body triangle
    ctx.save();
    ctx.translate(creatureCanvasX, creatureCanvasY);
    ctx.rotate(creature.heading);
    ctx.shadowColor = hsl(creature.hue, 100, 55);
    ctx.shadowBlur = worldToCanvasSize(8, scaleX, scaleY);
    ctx.fillStyle = hsl(creature.hue, 85, 55);
    ctx.beginPath();
    ctx.moveTo(creatureSize * 1.2, 0);
    ctx.lineTo(-creatureSize * 0.7, creatureSize * 0.65);
    ctx.lineTo(-creatureSize * 0.3, 0);
    ctx.lineTo(-creatureSize * 0.7, -creatureSize * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Energy bar
    const barWidth = worldToCanvasSize(creature.sz * 2.2, scaleX, scaleY);
    const barHeight = worldToCanvasSize(1.8, scaleX, scaleY);
    const energyFraction = clamp(creature.energy / creature.maxE, 0, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(creatureCanvasX - barWidth / 2, creatureCanvasY - creatureSize * 1.5 - barHeight, barWidth, barHeight);
    ctx.fillStyle = energyFraction > 0.3 ? '#00ff88' : energyFraction > 0.15 ? '#ffaa33' : '#ff4466';
    ctx.fillRect(creatureCanvasX - barWidth / 2, creatureCanvasY - creatureSize * 1.5 - barHeight, barWidth * energyFraction, barHeight);

    // Selection ring
    if (selected === creature) {
      const pulseRadius = Math.sin(Date.now() * 0.008) * 2 + 4;
      ctx.strokeStyle = hsl(creature.hue, 100, 65, 0.7);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(creatureCanvasX, creatureCanvasY, creatureSize + worldToCanvasSize(pulseRadius, scaleX, scaleY), 0, TAU); ctx.stroke();
    }
  }

  // Particles
  for (const particle of sim.particles) {
    ctx.globalAlpha = particle.alpha;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(
      worldToCanvasX(particle.x, scaleX),
      worldToCanvasY(particle.y, scaleY),
      worldToCanvasSize(particle.sz * particle.alpha, scaleX, scaleY),
      0,
      TAU,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
