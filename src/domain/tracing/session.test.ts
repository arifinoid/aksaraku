import { describe, expect, test } from "bun:test";
import type { StrokePath, Vec2 } from "../types";
import { line, samplePath } from "./sampling";
import {
  createSession,
  currentStroke,
  endStroke,
  overallCoverage,
  traceAccuracy,
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

describe("tracePoint tolerance scaling", () => {
  test("the same physical offset gives the same verdict on any canvas", () => {
    const stroke = horizontalStroke(36);
    const offsetDesign = 30; // 30 px below the line
    for (const scale of [3, 5.4, 10]) {
      const step = tracePoint(
        createSession([stroke]),
        p(50, 50 + offsetDesign / scale),
        0,
        1 / scale,
      );
      expect(step.event._tag).toBe("Progress");
    }
  });

  test("beyond the pixel tolerance counts as off track", () => {
    const stroke = horizontalStroke(36);
    const scale = 3;
    const step = tracePoint(
      createSession([stroke]),
      p(50, 50 + 40 / scale),
      0,
      1 / scale,
    );
    expect(step.event._tag).toBe("OffTrack");
  });

  test("without scaling the tolerance is read as design units", () => {
    const stroke = horizontalStroke(5);
    const step = tracePoint(createSession([stroke]), p(50, 60), 0);
    expect(step.event._tag).toBe("OffTrack");
  });
});

describe("tracePoint", () => {
  test("starts drawing on first touch", () => {
    const step = tracePoint(createSession([horizontalStroke()]), p(10, 50), 0);
    expect(step.session.phase).toBe("drawing");
    expect(step.session.startedAt).toBe(0);
  });

  test("completes a single stroke item once the child lifts their finger", () => {
    const points = [10, 20, 30, 40, 50, 60, 70].map((x) => p(x, 50));
    const { session } = run([horizontalStroke()], points);

    expect(session.phase).toBe("drawing");

    const step = endStroke(session, 100);

    expect(step.event._tag).toBe("ItemCompleted");
    expect(step.session.phase).toBe("completed");
    expect(step.session.completedAt).toBe(100);
    expect(overallCoverage(step.session)).toBeCloseTo(0.875);
  });

  test("keeps the last stroke open while it is still incomplete", () => {
    // Only the first segment of the stroke is traced.
    const { session } = run([horizontalStroke()], [p(10, 50), p(20, 50)]);

    const step = endStroke(session, 100);

    expect(step.event._tag).toBe("Progress");
    expect(step.session.phase).toBe("drawing");
    expect(step.session.strokeIndex).toBe(0);
  });

  test("advances to the next stroke when a finished one is closed", () => {
    const strokes = [horizontalStroke(), horizontalStroke()];
    const points = [10, 20, 30, 40, 50, 60, 70, 10, 20, 30, 40, 50, 60, 70].map(
      (x) => p(x, 50),
    );
    const { session, events } = run(strokes, points);

    // The first stroke passed the completion threshold and moved the child on
    // to the second one; the second is closed by lifting the finger.
    expect(session.strokeIndex).toBe(1);
    expect(session.phase).toBe("drawing");
    expect(events.some((event) => event._tag === "StrokeCompleted")).toBe(true);

    const closed = endStroke(session, 200);

    expect(closed.event._tag).toBe("ItemCompleted");
    expect(closed.session.phase).toBe("completed");
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
    const completed = endStroke(session, 100).session;
    const step = tracePoint(completed, p(50, 50), 999);

    expect(step.event._tag).toBe("Ignored");
    expect(step.session).toBe(completed);
  });
});

describe("traceAccuracy", () => {
  test("a closed stroke scores one", () => {
    const points = [10, 20, 30, 40, 50, 60, 70].map((x) => p(x, 50));
    const { session } = run([horizontalStroke()], points);
    const closed = endStroke(session, 100).session;

    expect(closed.phase).toBe("completed");
    expect(traceAccuracy(closed)).toBe(1);
  });

  test("an unfinished stroke is scored by what was traced", () => {
    const { session } = run([horizontalStroke()], [p(10, 50), p(20, 50)]);

    expect(traceAccuracy(session)).toBeLessThan(1);
  });
});
