import { match } from "ts-pattern";
import type { StrokePath, Vec2 } from "../types";
import { segmentDistances } from "./geometry";

export const COMPLETION_THRESHOLD = 0.8;

export type TracePhase = "idle" | "drawing" | "completed";

export interface TraceSession {
  readonly strokes: readonly StrokePath[];
  readonly strokeIndex: number;
  readonly covered: readonly (readonly boolean[])[];
  readonly deviationSum: number;
  readonly deviationCount: number;
  readonly offTrackCount: number;
  readonly phase: TracePhase;
  readonly startedAt: number | null;
  readonly completedAt: number | null;
}

export type TraceEvent =
  | { readonly _tag: "Ignored" }
  | { readonly _tag: "OffTrack" }
  | {
      readonly _tag: "Progress";
      readonly strokeIndex: number;
      readonly coverage: number;
    }
  | { readonly _tag: "StrokeCompleted"; readonly strokeIndex: number }
  | { readonly _tag: "ItemCompleted" };

export interface TraceStep {
  readonly session: TraceSession;
  readonly event: TraceEvent;
}

const emptyCovered = (stroke: StrokePath): readonly boolean[] =>
  new Array<boolean>(Math.max(0, stroke.points.length - 1)).fill(false);

export const createSession = (
  strokes: readonly StrokePath[],
): TraceSession => ({
  strokes,
  strokeIndex: 0,
  covered: strokes.map(emptyCovered),
  deviationSum: 0,
  deviationCount: 0,
  offTrackCount: 0,
  phase: "idle",
  startedAt: null,
  completedAt: null,
});

export const totalSegments = (session: TraceSession): number =>
  session.covered.reduce((sum, stroke) => sum + stroke.length, 0);

export const coveredSegments = (session: TraceSession): number =>
  session.covered.reduce(
    (sum, stroke) => sum + stroke.filter(Boolean).length,
    0,
  );

export const overallCoverage = (session: TraceSession): number => {
  const total = totalSegments(session);
  return total === 0 ? 0 : coveredSegments(session) / total;
};

export const strokeCoverage = (covered: readonly boolean[]): number =>
  covered.length === 0 ? 1 : covered.filter(Boolean).length / covered.length;

export const currentStroke = (
  session: TraceSession,
): StrokePath | undefined => session.strokes[session.strokeIndex];

const minOf = (values: readonly number[]): number =>
  values.length === 0
    ? Number.POSITIVE_INFINITY
    : values.reduce((min, value) => (value < min ? value : min), Number.POSITIVE_INFINITY);

const complete = (session: TraceSession, now: number): TraceStep => ({
  session: {
    ...session,
    phase: "completed",
    completedAt: session.completedAt ?? now,
  },
  event: { _tag: "ItemCompleted" },
});

const applyPoint = (
  session: TraceSession,
  point: Vec2,
  now: number,
  designPerPx: number,
): TraceStep => {
  const stroke = currentStroke(session);
  const covered = session.covered[session.strokeIndex];

  if (!stroke || !covered) return complete(session, now);

  const tolerance = stroke.tolerance * designPerPx;
  const distances = segmentDistances(point, stroke.points);
  const minDistance = minOf(distances);
  const deviationSum = session.deviationSum + minDistance;
  const deviationCount = session.deviationCount + 1;

  if (minDistance > tolerance) {
    return {
      session: {
        ...session,
        deviationSum,
        deviationCount,
        offTrackCount: session.offTrackCount + 1,
      },
      event: { _tag: "OffTrack" },
    };
  }

  const nextStrokeCovered = covered.map(
    (was, index) =>
      was || (distances[index] ?? Number.POSITIVE_INFINITY) <= tolerance,
  );
  const nextCovered = session.covered.map((entry, index) =>
    index === session.strokeIndex ? nextStrokeCovered : entry,
  );
  const coverage = strokeCoverage(nextStrokeCovered);

  if (coverage >= COMPLETION_THRESHOLD) {
    const isLastStroke = session.strokeIndex >= session.strokes.length - 1;
    if (isLastStroke) {
      return {
        session: {
          ...session,
          covered: nextCovered,
          deviationSum,
          deviationCount,
          phase: "completed",
          completedAt: now,
        },
        event: { _tag: "ItemCompleted" },
      };
    }
    return {
      session: {
        ...session,
        covered: nextCovered,
        deviationSum,
        deviationCount,
        strokeIndex: session.strokeIndex + 1,
      },
      event: { _tag: "StrokeCompleted", strokeIndex: session.strokeIndex },
    };
  }

  return {
    session: { ...session, covered: nextCovered, deviationSum, deviationCount },
    event: { _tag: "Progress", strokeIndex: session.strokeIndex, coverage },
  };
};

/**
 * `designPerPx` converts the stroke tolerance (screen pixels) into design
 * units, so a fingertip keeps the same physical tolerance on every screen.
 */
export const tracePoint = (
  session: TraceSession,
  point: Vec2,
  now: number,
  designPerPx = 1,
): TraceStep =>
  match(session.phase)
    .with("completed", (): TraceStep => ({ session, event: { _tag: "Ignored" } }))
    .with("idle", (): TraceStep =>
      applyPoint(
        { ...session, phase: "drawing", startedAt: now },
        point,
        now,
        designPerPx,
      ),
    )
    .with("drawing", (): TraceStep =>
      applyPoint(session, point, now, designPerPx),
    )
    .exhaustive();
