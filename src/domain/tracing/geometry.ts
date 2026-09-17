import type { Vec2 } from "../types";

export const distance = (a: Vec2, b: Vec2): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

export const clamp = (value: number, min: number, max: number): number =>
  value < min ? min : value > max ? max : value;

export const distanceToSegment = (p: Vec2, a: Vec2, b: Vec2): number => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) return distance(p, a);
  const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq, 0, 1);
  return distance(p, { x: a.x + t * dx, y: a.y + t * dy });
};

export const segmentDistances = (
  p: Vec2,
  points: readonly Vec2[],
): readonly number[] => {
  const result: number[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    result.push(distanceToSegment(p, points[i]!, points[i + 1]!));
  }
  return result;
};

export const distanceToPolyline = (
  p: Vec2,
  points: readonly Vec2[],
): number => {
  if (points.length === 0) return Number.POSITIVE_INFINITY;
  const first = points[0]!;
  if (points.length === 1) return distance(p, first);
  const distances = segmentDistances(p, points);
  return distances.reduce((min, value) => (value < min ? value : min), Number.POSITIVE_INFINITY);
};

export const polylineLength = (points: readonly Vec2[]): number => {
  let total = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    total += distance(points[i]!, points[i + 1]!);
  }
  return total;
};

export const lerp = (a: Vec2, b: Vec2, t: number): Vec2 => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});
