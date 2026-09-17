import { describe, expect, test } from "bun:test";
import {
  distanceToPolyline,
  distanceToSegment,
  polylineLength,
} from "./geometry";
import type { Vec2 } from "../types";

const p = (x: number, y: number): Vec2 => ({ x, y });

describe("distanceToSegment", () => {
  test("returns zero for a point on the segment", () => {
    expect(distanceToSegment(p(5, 0), p(0, 0), p(10, 0))).toBeCloseTo(0);
  });

  test("clamps to the nearest endpoint", () => {
    expect(distanceToSegment(p(-5, 0), p(0, 0), p(10, 0))).toBeCloseTo(5);
    expect(distanceToSegment(p(15, 0), p(0, 0), p(10, 0))).toBeCloseTo(5);
  });

  test("computes perpendicular distance", () => {
    expect(distanceToSegment(p(5, 3), p(0, 0), p(10, 0))).toBeCloseTo(3);
  });

  test("handles a degenerate segment", () => {
    expect(distanceToSegment(p(3, 4), p(0, 0), p(0, 0))).toBeCloseTo(5);
  });
});

describe("distanceToPolyline", () => {
  const polyline = [p(0, 0), p(10, 0), p(10, 10)];

  test("finds the closest segment", () => {
    expect(distanceToPolyline(p(10, 5), polyline)).toBeCloseTo(0);
    expect(distanceToPolyline(p(5, 2), polyline)).toBeCloseTo(2);
  });

  test("returns infinity for an empty polyline", () => {
    expect(distanceToPolyline(p(0, 0), [])).toBe(Number.POSITIVE_INFINITY);
  });

  test("handles a single point polyline", () => {
    expect(distanceToPolyline(p(3, 4), [p(0, 0)])).toBeCloseTo(5);
  });
});

describe("polylineLength", () => {
  test("sums segment lengths", () => {
    expect(polylineLength([p(0, 0), p(3, 4), p(3, 14)])).toBeCloseTo(15);
  });
});
