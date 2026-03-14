export type Species = 'herb' | 'carn' | 'omni';

export interface TrailPoint {
  x: number;
  y: number;
}

export interface HistoryEntry {
  h: number;
  c: number;
  o: number;
}

export interface SimStats {
  herbs: number;
  carns: number;
  omnis: number;
  food: number;
  hE: number;
  cE: number;
  oE: number;
  maxGen: number;
  bestFit: string;
  time: number;
}

export interface NNLayer {
  w: Float64Array;
  b: Float64Array;
}
