import type { Creature } from '../engine/creature';
import { TAU, clamp, hsl } from '../engine/utils';

const INPUT_LABELS = ['Food Dir', 'Food Dist', 'Threat Dir', 'Threat Dist', 'Ally Dir', 'Ally Dist', 'Energy', 'Wall F', 'Wall L', 'Wall R'];
const OUTPUT_LABELS = ['Turn', 'Speed', 'Action'];

export interface BrainVizSize {
  w: number;
  h: number;
}

export function setupBrainCanvas(canvas: HTMLCanvasElement): BrainVizSize {
  const canvasBounds = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvasBounds.width * dpr;
  canvas.height = canvasBounds.height * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w: canvasBounds.width, h: canvasBounds.height };
}

export interface BrainStatValues {
  species: string;
  speciesColor: string;
  gen: string;
  energy: string;
  fitness: string;
  age: string;
  eaten: string;
}

export function renderBrain(
  canvas: HTMLCanvasElement,
  creature: Creature | null,
  size: BrainVizSize,
): BrainStatValues | null {
  const ctx = canvas.getContext('2d')!;
  const { w: canvasWidth, h: canvasHeight } = size;
  ctx.fillStyle = '#080818';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  if (!creature || !creature.acts) {
    ctx.fillStyle = '#4488ff';
    ctx.font = 'bold 13px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Click a creature to inspect', canvasWidth / 2, canvasHeight / 2 - 8);
    ctx.font = '11px system-ui';
    ctx.fillStyle = '#556699';
    ctx.fillText('its neural network in real-time', canvasWidth / 2, canvasHeight / 2 + 12);
    return null;
  }

  const topology = creature.brain.topo;
  const networkLayers = creature.brain.layers;
  const activations = creature.acts;
  const layerCount = topology.length;
  const leftPadding = 62;
  const rightPadding = 50;
  const verticalPadding = 16;
  const layerGap = (canvasWidth - leftPadding - rightPadding) / (layerCount - 1);

  // Compute node positions
  const nodePositions: { x: number; y: number }[][] = [];
  for (let layerIndex = 0; layerIndex < layerCount; layerIndex++) {
    nodePositions[layerIndex] = [];
    const nodeCount = topology[layerIndex]!;
    const nodeGap = (canvasHeight - verticalPadding * 2) / (nodeCount + 1);
    const layerX = leftPadding + layerIndex * layerGap;
    for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
      nodePositions[layerIndex]![nodeIndex] = { x: layerX, y: verticalPadding + nodeGap * (nodeIndex + 1) };
    }
  }

  // Draw connections
  for (let layerIndex = 0; layerIndex < networkLayers.length; layerIndex++) {
    const weights = networkLayers[layerIndex]!.w;
    const sourceNodeCount = topology[layerIndex]!;
    const targetNodeCount = topology[layerIndex + 1]!;
    for (let targetNodeIndex = 0; targetNodeIndex < targetNodeCount; targetNodeIndex++) {
      for (let sourceNodeIndex = 0; sourceNodeIndex < sourceNodeCount; sourceNodeIndex++) {
        const connectionWeight = weights[targetNodeIndex * sourceNodeCount + sourceNodeIndex]!;
        const weightStrength = Math.min(Math.abs(connectionWeight), 2.5) / 2.5;
        if (weightStrength < 0.05) continue;
        const sourcePosition = nodePositions[layerIndex]![sourceNodeIndex]!;
        const targetPosition = nodePositions[layerIndex + 1]![targetNodeIndex]!;
        ctx.strokeStyle = connectionWeight >= 0
          ? `rgba(255,110,110,${weightStrength * 0.7})`
          : `rgba(110,150,255,${weightStrength * 0.7})`;
        ctx.lineWidth = 0.4 + weightStrength * 2;
        ctx.beginPath(); ctx.moveTo(sourcePosition.x, sourcePosition.y); ctx.lineTo(targetPosition.x, targetPosition.y); ctx.stroke();
      }
    }
  }

  // Draw nodes
  for (let layerIndex = 0; layerIndex < layerCount; layerIndex++) {
    for (let nodeIndex = 0; nodeIndex < topology[layerIndex]!; nodeIndex++) {
      const activationMagnitude = activations[layerIndex] ? Math.abs(activations[layerIndex]![nodeIndex]!) : 0;
      const brightness = clamp(activationMagnitude, 0, 1);
      const nodePosition = nodePositions[layerIndex]![nodeIndex]!;
      const nodeRadius = 4.5;

      // Glow
      ctx.fillStyle = `rgba(0,255,140,${brightness * 0.25})`;
      ctx.beginPath(); ctx.arc(nodePosition.x, nodePosition.y, nodeRadius * 1.8, 0, TAU); ctx.fill();

      // Node
      const nodeLightness = 20 + brightness * 55;
      ctx.fillStyle = hsl(layerIndex === layerCount - 1 ? 30 : 150, 90, nodeLightness);
      ctx.beginPath(); ctx.arc(nodePosition.x, nodePosition.y, nodeRadius, 0, TAU); ctx.fill();

      // Border
      ctx.strokeStyle = `rgba(255,255,255,${0.15 + brightness * 0.3})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  // Labels
  ctx.font = 'bold 8px system-ui';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let inputNodeIndex = 0; inputNodeIndex < topology[0]!; inputNodeIndex++) {
    const activationValue = activations[0] ? activations[0]![inputNodeIndex]! : 0;
    ctx.fillStyle = hsl(220, 70, 50 + Math.abs(activationValue) * 30);
    ctx.fillText(INPUT_LABELS[inputNodeIndex] ?? '', nodePositions[0]![inputNodeIndex]!.x - 8, nodePositions[0]![inputNodeIndex]!.y);
  }
  ctx.textAlign = 'left';
  const outputLayerIndex = layerCount - 1;
  for (let outputNodeIndex = 0; outputNodeIndex < topology[outputLayerIndex]!; outputNodeIndex++) {
    const activationValue = activations[outputLayerIndex] ? activations[outputLayerIndex]![outputNodeIndex]! : 0;
    ctx.fillStyle = hsl(15, 80, 50 + activationValue * 30);
    ctx.fillText(OUTPUT_LABELS[outputNodeIndex] ?? '', nodePositions[outputLayerIndex]![outputNodeIndex]!.x + 8, nodePositions[outputLayerIndex]![outputNodeIndex]!.y);
  }

  // Return stat values for the component to display
  const speciesName = creature.herb ? 'Herbivore' : creature.carn ? 'Carnivore' : 'Omnivore';
  const speciesColor = creature.herb ? '#00ff88' : creature.carn ? '#ff4466' : '#ff9933';
  return {
    species: speciesName,
    speciesColor,
    gen: 'G' + creature.gen,
    energy: String(Math.round(creature.energy)),
    fitness: creature.fitness.toFixed(1),
    age: creature.age.toFixed(1) + 's',
    eaten: String(creature.foodEaten),
  };
}
