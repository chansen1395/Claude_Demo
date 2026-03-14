export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  sz: number;

  constructor(x: number, y: number, vx: number, vy: number, color: string, life: number) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.sz = 2 + Math.random() * 2;
  }

  update(dt: number): void {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
  }

  get alpha(): number {
    return Math.max(0, this.life / this.maxLife);
  }

  get dead(): boolean {
    return this.life <= 0;
  }
}
