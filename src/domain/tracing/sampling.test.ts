import { describe, expect, test } from "bun:test";
import {
  arcPoints,
  ellipsePoints,
  line,
  quad,
  samplePath,
  sampleSegment,
} from "./sampling";
import type { Vec2 } from "../types";

const p = (x: number, y: number): Vec2 => ({ x, y });

describe("sampleSegment", () => {
  test("samples a line including both endpoints", () => {
    const points = sampleSegment(line(p(0, 0), p(10, 0)), 4);
    expect(points).toHaveLength(5);
    expect(points[0]).toEqual(p(0, 0));
    expect(points[4]).toEqual(p(10, 0));
  });

  test("samples a quadratic curve through the midpoint", () => {
    const points = sampleSegment(quad(p(0, 0), p(5, 10), p(10, 0)), 8);
    const mid = points[4]!;
    expect(mid.x).toBeCloseTo(5);
    expect(mid.y).toBeCloseTo(5);
  });

  test("enforces a minimum of two samples", () => {
    expect(sampleSegment(line(p(0, 0), p(1, 0)), 0)).toHaveLength(3);
  });
});

describe("samplePath", () => {
  test("joins segments without duplicating shared points", () => {
    const points = samplePath(
      [line(p(0, 0), p(10, 0)), line(p(10, 0), p(10, 10))],
      2,
    );
    expect(points[0]).toEqual(p(0, 0));
    expect(points[points.length - 1]).toEqual(p(10, 10));
    expect(points.filter((point) => point.x === 10 && point.y === 0)).toHaveLength(1);
  });
});

describe("arcPoints", () => {
  test("starts and ends at the requested angles", () => {
    const points = arcPoints(p(50, 50), 10, 0, 90, 4);
    expect(points).toHaveLength(5);
    expect(points[0]!.x).toBeCloseTo(60);
    expect(points[0]!.y).toBeCloseTo(50);
    expect(points[4]!.x).toBeCloseTo(50);
    expect(points[4]!.y).toBeCloseTo(60);
  });
});

describe("ellipsePoints", () => {
  test("respects radius per axis", () => {
    const points = ellipsePoints(p(0, 0), 20, 10, 0, 360, 4);
    expect(points[0]).toEqual(p(20, 0));
    expect(points[1]!.x).toBeCloseTo(0);
    expect(points[1]!.y).toBeCloseTo(10);
  });
});
