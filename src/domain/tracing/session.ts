import { match } from "ts-pattern";
import type { StrokePath, Vec2 } from "../types";
import { distanceToPolyline, segmentDistances } from "./geometry";

/**
 * How much of a stroke counts as "drawn". Reaching it completes the stroke and
 * moves the child on to the next one, so it is deliberately forgiving — the
 * last few pixels of a curve are the hardest to trace.
 *
 * This is a completion rule, not a scoring rule. Accuracy is measured with
 * `traceAccuracy`, which normalises a finished stroke to a full score.
 */
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

/**
 * Accuracy used for scoring.
 *
 * A stroke the child has finished counts as fully drawn even though the
 * completion threshold let them move on before the last few pixels were
 * traced. Without that normalisation the raw coverage of a typical glyph
 * tops out around 0.80-0.85, which made three stars unreachable for most
 * of the catalogue.
 */
export const traceAccuracy = (session: TraceSession): number => {
  const total = totalSegments(session);
  if (total === 0) return 0;

  let score = 0;
  session.covered.forEach((covered, index) => {
    const finished =
      index < session.strokeIndex ||
      (session.phase === "completed" && index === session.strokeIndex);
    const ratio =
      covered.length === 0 ? 1 : covered.filter(Boolean).length / covered.length;
    score += finished ? 1 : ratio;
  });

  return score / session.covered.length;
};

export const strokeCoverage = (covered: readonly boolean[]): number =>
  covered.length === 0 ? 1 : covered.filter(Boolean).length / covered.length;

export const currentStroke = (
  session: TraceSession,
): StrokePath | undefined => session.strokes[session.strokeIndex];

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

  if (!stroke) return complete(session, now);

  // Every stroke up to the active one stays open for credit. The child often
  // keeps drawing the tail of the stroke that just auto-advanced, and that
  // tail must still count — otherwise the score is capped below the
  // three-star threshold for most glyphs.
  //
  // Only the active stroke and the one before it are measured: those are the
  // two the finger can plausibly be on, and measuring every stroke on every
  // pointermove is too expensive for a tablet.
  const measureFrom = Math.max(0, session.strokeIndex - 1);
  const candidates: {
    readonly distance: number;
    readonly tolerance: number;
  }[] = [];
  for (let index = measureFrom; index <= session.strokeIndex; index += 1) {
    const target = session.strokes[index];
    if (!target) continue;
    candidates.push({
      distance: distanceToPolyline(point, target.points),
      tolerance: target.tolerance * designPerPx,
    });
  }

  const nearest = candidates.reduce(
    (best, candidate) =>
      candidate.distance < best.distance ? candidate : best,
    {
      distance: Number.POSITIVE_INFINITY,
      tolerance: stroke.tolerance * designPerPx,
    },
  );

  const deviationSum = session.deviationSum + nearest.distance;
  const deviationCount = session.deviationCount + 1;

  const nextCovered = session.covered.map((entry, index) => {
    if (index < measureFrom || index > session.strokeIndex) return entry;
    const target = session.strokes[index];
    if (!target) return entry;
    const targetTolerance = target.tolerance * designPerPx;
    const distances = segmentDistances(point, target.points);
    return entry.map(
      (was, segmentIndex) =>
        was ||
        (distances[segmentIndex] ?? Number.POSITIVE_INFINITY) <=
          targetTolerance,
    );
  });

  if (nearest.distance > nearest.tolerance) {
    return {
      session: {
        ...session,
        covered: nextCovered,
        deviationSum,
        deviationCount,
        offTrackCount: session.offTrackCount + 1,
      },
      event: { _tag: "OffTrack" },
    };
  }

  const covered = nextCovered[session.strokeIndex];
  const coverage = strokeCoverage(covered ?? []);
  const isLastStroke = session.strokeIndex >= session.strokes.length - 1;

  if (isLastStroke) {
    // The final stroke decides the score, so it is only closed once the child
    // has traced all of it. A partial attempt is closed when the child lifts
    // their finger — see `endStroke`.
    if (coverage >= 1) {
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
      },
      event: { _tag: "Progress", strokeIndex: session.strokeIndex, coverage },
    };
  }

  if (coverage >= COMPLETION_THRESHOLD) {
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
    session: {
      ...session,
      covered: nextCovered,
      deviationSum,
      deviationCount,
    },
    event: { _tag: "Progress", strokeIndex: session.strokeIndex, coverage },
  };
};

/**
 * Called when the child lifts their finger.
 *
 * A stroke that reached the completion threshold is accepted: the item
 * completes if it was the last stroke, otherwise the child moves on to the
 * next one. Below the threshold nothing happens — the child keeps tracing
 * the same stroke.
 */
export const endStroke = (
  session: TraceSession,
  now: number,
): TraceStep => {
  if (session.phase === "completed") {
    return { session, event: { _tag: "Ignored" } };
  }

  const covered = session.covered[session.strokeIndex];
  if (!covered) return complete(session, now);

  const coverage = strokeCoverage(covered);
  if (coverage < COMPLETION_THRESHOLD) {
    return {
      session,
      event: { _tag: "Progress", strokeIndex: session.strokeIndex, coverage },
    };
  }

  if (session.strokeIndex >= session.strokes.length - 1) {
    return {
      session: {
        ...session,
        phase: "completed",
        completedAt: now,
      },
      event: { _tag: "ItemCompleted" },
    };
  }

  return {
    session: { ...session, strokeIndex: session.strokeIndex + 1 },
    event: { _tag: "StrokeCompleted", strokeIndex: session.strokeIndex },
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
