import { describe, expect, test } from "bun:test";
import type { Vec2 } from "../types";
import { DESIGN_SIZE, designTransform, toDesignSpace, toScreenSpace } from "./viewport";

const p = (x: number, y: number): Vec2 => ({ x, y });

describe("designTransform", () => {
  test("scales to the smaller viewport axis", () => {
    const transform = designTransform({ width: 200, height: 100 });
    expect(transform.scale).toBe(1);
    expect(transform.offsetX).toBe(50);
    expect(transform.offsetY).toBe(0);
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
