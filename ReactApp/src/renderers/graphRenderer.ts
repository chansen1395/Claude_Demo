import type { HistoryEntry } from '../engine/types';

export interface GraphSize {
  w: number;
  h: number;
}

export function setupGraphCanvas(canvas: HTMLCanvasElement): GraphSize {
  const canvasBounds = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvasBounds.width * dpr;
  canvas.height = canvasBounds.height * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w: canvasBounds.width, h: canvasBounds.height };
}

export function renderGraph(
  canvas: HTMLCanvasElement,
  history: HistoryEntry[],
  size: GraphSize,
): void {
  const ctx = canvas.getContext('2d')!;
  const { w: canvasWidth, h: canvasHeight } = size;
  ctx.fillStyle = '#080818';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  if (history.length < 2) {
    ctx.fillStyle = '#445566';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Gathering population data...', canvasWidth / 2, canvasHeight / 2);
    return;
  }

  const chartPadding = { l: 30, r: 10, t: 12, b: 12 };
  const graphWidth = canvasWidth - chartPadding.l - chartPadding.r;
  const graphHeight = canvasHeight - chartPadding.t - chartPadding.b;

  // Grid
  ctx.strokeStyle = 'rgba(0,255,136,0.08)';
  ctx.lineWidth = 0.5;
  for (let gridLineIndex = 0; gridLineIndex < 5; gridLineIndex++) {
    const gridY = chartPadding.t + (gridLineIndex / 4) * graphHeight;
    ctx.beginPath(); ctx.moveTo(chartPadding.l, gridY); ctx.lineTo(chartPadding.l + graphWidth, gridY); ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = 'rgba(0,255,136,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(chartPadding.l, chartPadding.t);
  ctx.lineTo(chartPadding.l, chartPadding.t + graphHeight);
  ctx.lineTo(chartPadding.l + graphWidth, chartPadding.t + graphHeight);
  ctx.stroke();

  // Find max
  let maxPopulation = 10;
  for (const historyEntry of history) maxPopulation = Math.max(maxPopulation, historyEntry.h, historyEntry.c, historyEntry.o);
  maxPopulation = Math.ceil(maxPopulation * 1.15);

  // Y axis labels
  ctx.fillStyle = '#445566';
  ctx.font = '8px monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let labelIndex = 0; labelIndex <= 4; labelIndex++) {
    const labelValue = Math.round(maxPopulation * (1 - labelIndex / 4));
    ctx.fillText(String(labelValue), chartPadding.l - 4, chartPadding.t + (labelIndex / 4) * graphHeight);
  }

  // Draw lines
  const drawLine = (key: keyof HistoryEntry, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    for (let historyIndex = 0; historyIndex < history.length; historyIndex++) {
      const chartX = chartPadding.l + (historyIndex / (history.length - 1)) * graphWidth;
      const chartY = chartPadding.t + graphHeight - (history[historyIndex]![key] / maxPopulation) * graphHeight;
      historyIndex === 0 ? ctx.moveTo(chartX, chartY) : ctx.lineTo(chartX, chartY);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  };
  drawLine('h', '#00ff88');
  drawLine('c', '#ff4466');
  drawLine('o', '#ff9933');

  // Legend
  ctx.font = 'bold 9px system-ui';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#00ff88'; ctx.fillText('● Herbs', canvasWidth - 85, 14);
  ctx.fillStyle = '#ff4466'; ctx.fillText('● Carns', canvasWidth - 85, 25);
  ctx.fillStyle = '#ff9933'; ctx.fillText('● Omnis', canvasWidth - 85, 36);
}
