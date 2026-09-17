import { overallCoverage, type TraceSession } from "./session";

export type StarCount = 0 | 1 | 2 | 3;

export interface TraceScore {
  readonly accuracy: number;
  readonly deviationAvg: number;
  readonly offTrackCount: number;
  readonly durationMs: number;
  readonly stars: StarCount;
}

export const starsForAccuracy = (accuracy: number): StarCount =>
  accuracy >= 0.95 ? 3 : accuracy >= 0.85 ? 2 : accuracy >= 0.6 ? 1 : 0;

export const scoreSession = (
  session: TraceSession,
  now: number,
): TraceScore => {
  const accuracy = overallCoverage(session);
  const end = session.completedAt ?? now;
  const start = session.startedAt ?? end;
  return {
    accuracy,
    deviationAvg:
      session.deviationCount === 0
        ? 0
        : session.deviationSum / session.deviationCount,
    offTrackCount: session.offTrackCount,
    durationMs: Math.max(0, end - start),
    stars: starsForAccuracy(accuracy),
  };
};
