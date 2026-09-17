import { describe, expect, test } from "bun:test";
import {
  findGlyphItem,
  GLYPH_CATEGORIES,
  GLYPH_ITEMS,
  itemsByKind,
} from "./index";

const MIN = -5;
const MAX = 105;

describe("glyph content", () => {
  test("covers every category with the expected amount of items", () => {
    expect(itemsByKind("letter-upper")).toHaveLength(26);
    expect(itemsByKind("letter-lower")).toHaveLength(26);
    expect(itemsByKind("digit")).toHaveLength(10);
    expect(itemsByKind("shape")).toHaveLength(8);
    expect(GLYPH_ITEMS).toHaveLength(70);
  });

  test("uses unique ids", () => {
    const ids = GLYPH_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("gives every item a glyph, a phoneme, and at least one stroke", () => {
    for (const item of GLYPH_ITEMS) {
      expect(item.glyph.length).toBeGreaterThan(0);
      expect(item.phoneme.length).toBeGreaterThan(0);
      expect(item.strokes.length).toBeGreaterThan(0);
    }
  });

  test("keeps every stroke inside the design box with a usable tolerance", () => {
    for (const item of GLYPH_ITEMS) {
      item.strokes.forEach((stroke, index) => {
        expect(stroke.points.length).toBeGreaterThanOrEqual(2);
        expect(stroke.tolerance).toBeGreaterThan(0);
        expect(stroke.guideOrder).toBe(index);
        for (const point of stroke.points) {
          expect(Number.isFinite(point.x)).toBe(true);
          expect(Number.isFinite(point.y)).toBe(true);
          expect(point.x).toBeGreaterThanOrEqual(MIN);
          expect(point.x).toBeLessThanOrEqual(MAX);
          expect(point.y).toBeGreaterThanOrEqual(MIN);
          expect(point.y).toBeLessThanOrEqual(MAX);
        }
      });
    }
  });

  test("matches items to their category kind", () => {
    for (const category of GLYPH_CATEGORIES) {
      for (const item of category.items) {
        expect(item.kind).toBe(category.kind);
      }
    }
  });

  test("finds items by id", () => {
    expect(findGlyphItem("upper-a")?.glyph).toBe("A");
    expect(findGlyphItem("digit-7")?.glyph).toBe("7");
    expect(findGlyphItem("missing")).toBeUndefined();
  });
});
