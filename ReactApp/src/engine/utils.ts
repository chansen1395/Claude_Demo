export const TAU = Math.PI * 2;

export function gaussRand(): number {
  const uniformA = Math.random();
  const uniformB = Math.random();
  return Math.sqrt(-2 * Math.log(uniformA || 1e-10)) * Math.cos(TAU * uniformB);
}

export function sigmoid(x: number): number {
  return x > 15 ? 1 : x < -15 ? 0 : 1 / (1 + Math.exp(-x));
}

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function dist(pointA: { x: number; y: number }, pointB: { x: number; y: number }): number {
  const deltaX = pointA.x - pointB.x;
  const deltaY = pointA.y - pointB.y;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

export function normAngle(angle: number): number {
  let normalizedAngle = angle % TAU;
  if (normalizedAngle > Math.PI) normalizedAngle -= TAU;
  if (normalizedAngle < -Math.PI) normalizedAngle += TAU;
  return normalizedAngle;
}

export function hsl(hue: number, saturation: number, lightness: number, alpha?: number): string {
  return alpha !== undefined
    ? `hsla(${hue},${saturation}%,${lightness}%,${alpha})`
    : `hsl(${hue},${saturation}%,${lightness}%)`;
}
