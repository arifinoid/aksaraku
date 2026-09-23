import {
  arcPoints,
  cubic,
  ellipsePoints,
  line,
  samplePath,
  type ModuleItem,
  type ModuleItemId,
  type ModuleKind,
  type PathSegment,
  type StrokeDirection,
  type StrokePath,
  type Vec2,
} from "../../domain";

export const p = (x: number, y: number): Vec2 => ({ x, y });

/**
 * Finger tolerance in screen pixels. The tracing session converts it to design
 * units per frame, so the physical forgiveness stays constant whether the
 * canvas is 300px (phone) or 1000px (tablet).
 */
export const DEFAULT_TOLERANCE_PX = 36;

const STEPS = 12;
const DEG_TO_RAD = Math.PI / 180;

export const poly = (
  segments: readonly PathSegment[],
  steps = STEPS,
): readonly Vec2[] => samplePath(segments, steps);

export const seg = line;
export const curve = cubic;
export const arc = arcPoints;
export const ellipse = ellipsePoints;

export interface StrokeSpec {
  readonly points: readonly Vec2[];
  readonly direction?: StrokeDirection;
  /** Screen-pixel tolerance; defaults to `DEFAULT_TOLERANCE_PX`. */
  readonly tolerance?: number;
}

export const s = (
  points: readonly Vec2[],
  direction: StrokeDirection = "ltr",
  tolerance = DEFAULT_TOLERANCE_PX,
): StrokeSpec => ({ points, direction, tolerance });

export const ln = (
  from: Vec2,
  to: Vec2,
  direction: StrokeDirection = "ltr",
  tolerance = DEFAULT_TOLERANCE_PX,
): StrokeSpec => s(poly([seg(from, to)]), direction, tolerance);

export const toStrokes = (
  specs: readonly StrokeSpec[],
): readonly StrokePath[] =>
  specs.map((spec, index) => ({
    points: spec.points,
    direction: spec.direction ?? "ltr",
    tolerance: spec.tolerance ?? DEFAULT_TOLERANCE_PX,
    guideOrder: index,
  }));

export const item = (
  id: string,
  kind: ModuleKind,
  glyph: string,
  specs: readonly StrokeSpec[],
  phoneme: string,
): ModuleItem => ({
  id: id as ModuleItemId,
  kind,
  glyph,
  strokes: toStrokes(specs),
  phoneme,
  labelKey: "",
});

export const starPoints = (
  center: Vec2,
  outer: number,
  inner: number,
  count = 5,
): readonly Vec2[] => {
  const points: Vec2[] = [];
  const total = count * 2;
  for (let i = 0; i <= total; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (-90 + (360 * i) / total) * DEG_TO_RAD;
    points.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    });
  }
  return points;
};
