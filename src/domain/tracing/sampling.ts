import type { Vec2 } from "../types";
import { lerp } from "./geometry";

export type PathSegment =
  | { readonly kind: "line"; readonly from: Vec2; readonly to: Vec2 }
  | {
      readonly kind: "quad";
      readonly from: Vec2;
      readonly control: Vec2;
      readonly to: Vec2;
    }
  | {
      readonly kind: "cubic";
      readonly from: Vec2;
      readonly c1: Vec2;
      readonly c2: Vec2;
      readonly to: Vec2;
    };

export const line = (from: Vec2, to: Vec2): PathSegment => ({
  kind: "line",
  from,
  to,
});

export const quad = (from: Vec2, control: Vec2, to: Vec2): PathSegment => ({
  kind: "quad",
  from,
  control,
  to,
});

export const cubic = (
  from: Vec2,
  c1: Vec2,
  c2: Vec2,
  to: Vec2,
): PathSegment => ({ kind: "cubic", from, c1, c2, to });

export const sampleSegment = (
  segment: PathSegment,
  steps = 16,
): readonly Vec2[] => {
  const count = Math.max(2, Math.floor(steps));
  const points: Vec2[] = [];
  for (let i = 0; i <= count; i += 1) {
    const t = i / count;
    switch (segment.kind) {
      case "line":
        points.push(lerp(segment.from, segment.to, t));
        break;
      case "quad": {
        const a = lerp(segment.from, segment.control, t);
        const b = lerp(segment.control, segment.to, t);
        points.push(lerp(a, b, t));
        break;
      }
      case "cubic": {
        const a = lerp(segment.from, segment.c1, t);
        const b = lerp(segment.c1, segment.c2, t);
        const c = lerp(segment.c2, segment.to, t);
        const d = lerp(a, b, t);
        const e = lerp(b, c, t);
        points.push(lerp(d, e, t));
        break;
      }
    }
  }
  return points;
};

export const samplePath = (
  segments: readonly PathSegment[],
  steps = 16,
): readonly Vec2[] => {
  const points: Vec2[] = [];
  for (const segment of segments) {
    for (const point of sampleSegment(segment, steps)) {
      const last = points[points.length - 1];
      if (!last || Math.abs(last.x - point.x) > 1e-6 || Math.abs(last.y - point.y) > 1e-6) {
        points.push(point);
      }
    }
  }
  return points;
};

const DEG_TO_RAD = Math.PI / 180;

export const arcPoints = (
  center: Vec2,
  radius: number,
  startDeg: number,
  endDeg: number,
  steps = 24,
): readonly Vec2[] => {
  const count = Math.max(2, Math.floor(steps));
  const points: Vec2[] = [];
  for (let i = 0; i <= count; i += 1) {
    const angle = (startDeg + ((endDeg - startDeg) * i) / count) * DEG_TO_RAD;
    points.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    });
  }
  return points;
};

export const ellipsePoints = (
  center: Vec2,
  radiusX: number,
  radiusY: number,
  startDeg: number,
  endDeg: number,
  steps = 32,
): readonly Vec2[] => {
  const count = Math.max(2, Math.floor(steps));
  const points: Vec2[] = [];
  for (let i = 0; i <= count; i += 1) {
    const angle = (startDeg + ((endDeg - startDeg) * i) / count) * DEG_TO_RAD;
    points.push({
      x: center.x + Math.cos(angle) * radiusX,
      y: center.y + Math.sin(angle) * radiusY,
    });
  }
  return points;
};
