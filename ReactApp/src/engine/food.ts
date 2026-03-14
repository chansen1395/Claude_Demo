import { TAU } from './utils';

export class Food {
  x: number;
  y: number;
  eaten: boolean;
  phase: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.eaten = false;
    this.phase = Math.random() * TAU;
  }

  update(dt: number): void {
    this.phase = (this.phase + dt * 2.5) % TAU;
  }

  get pulse(): number {
    return 1 + Math.sin(this.phase) * 0.25;
  }
}
