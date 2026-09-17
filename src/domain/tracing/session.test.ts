import { describe, expect, test } from "bun:test";
import type { StrokePath, Vec2 } from "../types";
import { line, samplePath } from "./sampling";
import {
  createSession,
  currentStroke,
  overallCoverage,
  tracePoint,
  type TraceEvent,
  type TraceSession,
} from "./session";

const p = (x: number, y: number): Vec2 => ({ x, y });

const horizontalStroke = (tolerance = 5): StrokePath => ({
  points: samplePath([line(p(10, 50), p(90, 50))], 8),
  tolerance,
  guideOrder: 0,
  direction: "ltr",
});

const run = (
  strokes: readonly StrokePath[],
  points: readonly Vec2[],
): { readonly session: TraceSession; readonly events: readonly TraceEvent[] } => {
  let session = createSession(strokes);
  const events: TraceEvent[] = [];
  points.forEach((point, index) => {
    const step = tracePoint(session, point, index * 10);
    session = step.session;
    events.push(step.event);
  });
  return { session, events };
};

describe("createSession", () => {
  test("starts idle with no covered segments", () => {
    const session = createSession([horizontalStroke()]);
    expect(session.phase).toBe("idle");
    expect(session.strokeIndex).toBe(0);
    expect(overallCoverage(session)).toBe(0);
    expect(currentStroke(session)).toBeDefined();
  });
});

describe("tracePoint", () => {
  test("starts drawing on first touch", () => {
    const step = tracePoint(createSession([horizontalStroke()]), p(10, 50), 0);
    expect(step.session.phase).toBe("drawing");
    expect(step.session.startedAt).toBe(0);
  });

  test("completes a single stroke item", () => {
    const points = [10, 20, 30, 40, 50, 60, 70].map((x) => p(x, 50));
    const { session, events } = run([horizontalStroke()], points);

    expect(session.phase).toBe("completed");
    expect(session.completedAt).toBe(60);
    expect(overallCoverage(session)).toBeCloseTo(0.875);
    expect(events[events.length - 1]?._tag).toBe("ItemCompleted");
    expect(events.filter((event) => event._tag === "OffTrack")).toHaveLength(0);
  });

  test("advances through multiple strokes", () => {
    const strokes = [horizontalStroke(), horizontalStroke()];
    const points = [10, 20, 30, 40, 50, 60, 70, 10, 20, 30, 40, 50, 60, 70].map(
      (x) => p(x, 50),
    );
    const { session, events } = run(strokes, points);

    expect(session.phase).toBe("completed");
    expect(session.strokeIndex).toBe(1);
    expect(events.some((event) => event._tag === "StrokeCompleted")).toBe(true);
  });

  test("reports off track points without covering segments", () => {
    const { session, events } = run([horizontalStroke()], [p(50, 90)]);

    expect(events[0]?._tag).toBe("OffTrack");
    expect(session.offTrackCount).toBe(1);
    expect(overallCoverage(session)).toBe(0);
    expect(session.phase).toBe("drawing");
  });

  test("ignores input after completion", () => {
    const points = [10, 20, 30, 40, 50, 60, 70].map((x) => p(x, 50));
    const { session } = run([horizontalStroke()], points);
    const step = tracePoint(session, p(50, 50), 999);

    expect(step.event._tag).toBe("Ignored");
    expect(step.session).toBe(session);
  });
});
