import { describe, expect, test } from "bun:test";
import type { Vec2 } from "../types";
import {
  DESIGN_SIZE,
  designPerPx,
  designTransform,
  toDesignSpace,
  toScreenSpace,
} from "./viewport";

const p = (x: number, y: number): Vec2 => ({ x, y });

describe("designTransform", () => {
  test("scales to the smaller viewport axis", () => {
    const transform = designTransform({ width: 200, height: 100 });
    expect(transform.scale).toBe(1);
    expect(transform.offsetX).toBe(50);
    expect(transform.offsetY).toBe(0);
  });
});

describe("designPerPx", () => {
  test("is the inverse of the design scale", () => {
    const transform = designTransform({ width: 540, height: 540 });
    expect(designPerPx(transform)).toBeCloseTo(1 / transform.scale, 10);
    expect(designPerPx(transform) * 540).toBeCloseTo(DESIGN_SIZE, 6);
  });

  test("falls back to 1 for a degenerate transform", () => {
    expect(designPerPx({ scale: 0, offsetX: 0, offsetY: 0 })).toBe(1);
  });
});

describe("toDesignSpace", () => {
  const rect = { left: 10, top: 20, width: 200, height: 200 };

  test("maps the rect centre to the design centre", () => {
    expect(toDesignSpace(p(110, 120), rect)).toEqual(p(DESIGN_SIZE / 2, DESIGN_SIZE / 2));
  });

  test("round trips with toScreenSpace", () => {
    const transform = designTransform(rect);
    const screen = toScreenSpace(p(25, 75), transform);
    const client = p(screen.x + rect.left, screen.y + rect.top);
    const design = toDesignSpace(client, rect);

    expect(design.x).toBeCloseTo(25);
    expect(design.y).toBeCloseTo(75);
  });
});
