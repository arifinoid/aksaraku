import { describe, expect, test } from "bun:test";
import type { StrokePath, Vec2 } from "../types";
import { line, samplePath } from "./sampling";
import { scoreSession, starsForAccuracy } from "./score";
import { createSession, tracePoint } from "./session";

const p = (x: number, y: number): Vec2 => ({ x, y });

const stroke: StrokePath = {
  points: samplePath([line(p(10, 50), p(90, 50))], 8),
  tolerance: 5,
  guideOrder: 0,
  direction: "ltr",
};

const completedSession = () => {
  let session = createSession([stroke]);
  [10, 20, 30, 40, 50, 60, 70].forEach((x, index) => {
    session = tracePoint(session, p(x, 50), index * 100).session;
  });
  return session;
};

describe("starsForAccuracy", () => {
  test("maps accuracy to a generous star rating", () => {
    expect(starsForAccuracy(1)).toBe(3);
    expect(starsForAccuracy(0.95)).toBe(3);
    expect(starsForAccuracy(0.9)).toBe(2);
    expect(starsForAccuracy(0.7)).toBe(1);
    expect(starsForAccuracy(0.2)).toBe(0);
  });
});

describe("scoreSession", () => {
  test("summarises a completed session", () => {
    const session = completedSession();
    const score = scoreSession(session, 1000);

    expect(score.accuracy).toBeCloseTo(0.875);
    expect(score.offTrackCount).toBe(0);
    expect(score.deviationAvg).toBeCloseTo(0);
    expect(score.durationMs).toBe(600);
    expect(score.stars).toBe(2);
  });
});
