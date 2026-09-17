import { describe, expect, test } from "bun:test";
import type { ModuleItemId } from "../types";
import {
  addSticker,
  clearColoring,
  coloredStrokeCount,
  coloringScore,
  createColoringState,
  paintStroke,
  removeLastSticker,
} from "./coloring";

const itemId = "upper-a" as ModuleItemId;

describe("coloring", () => {
  test("starts empty", () => {
    const state = createColoringState(itemId);
    expect(state.fills).toEqual({});
    expect(state.stickers).toHaveLength(0);
    expect(coloredStrokeCount(state)).toBe(0);
  });

  test("paints strokes and keeps the latest color", () => {
    let state = createColoringState(itemId);
    state = paintStroke(state, 0, "#ff7a45");
    state = paintStroke(state, 1, "#4cc9f0");
    state = paintStroke(state, 0, "#57cc99");

    expect(coloredStrokeCount(state)).toBe(2);
    expect(state.fills[0]).toBe("#57cc99");
  });

  test("adds and removes stickers", () => {
    let state = createColoringState(itemId);
    state = addSticker(state, { id: "s1", emoji: "⭐", x: 10, y: 20 });
    state = addSticker(state, { id: "s2", emoji: "❤️", x: 30, y: 40 });
    expect(state.stickers).toHaveLength(2);

    state = removeLastSticker(state);
    expect(state.stickers.map((sticker) => sticker.id)).toEqual(["s1"]);
  });

  test("clears everything", () => {
    let state = createColoringState(itemId);
    state = paintStroke(state, 0, "#ff7a45");
    state = addSticker(state, { id: "s1", emoji: "⭐", x: 10, y: 20 });
    expect(clearColoring(state)).toEqual(createColoringState(itemId));
  });
});

describe("coloringScore", () => {
  test("is zero with no strokes to paint", () => {
    expect(coloringScore(createColoringState(itemId), 0)).toBe(0);
  });

  test("grows with painted strokes", () => {
    let state = createColoringState(itemId);
    state = paintStroke(state, 0, "#ff7a45");
    expect(coloringScore(state, 2)).toBeCloseTo(0.5);
  });

  test("adds a sticker bonus and never exceeds one", () => {
    let state = createColoringState(itemId);
    state = paintStroke(state, 0, "#ff7a45");
    state = paintStroke(state, 1, "#4cc9f0");
    state = addSticker(state, { id: "s1", emoji: "⭐", x: 10, y: 20 });
    expect(coloringScore(state, 2)).toBe(1);
  });

  test("ignores painted strokes beyond the stroke count", () => {
    let state = createColoringState(itemId);
    state = paintStroke(state, 0, "#ff7a45");
    state = paintStroke(state, 5, "#4cc9f0");
    expect(coloringScore(state, 1)).toBe(1);
  });
});
