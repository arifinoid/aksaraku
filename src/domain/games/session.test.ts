import { describe, expect, test } from "bun:test";
import type { ModuleItemId } from "../types";
import { itemAccuracies } from "./session";
import { pickOne, sample, shuffle } from "./random";

const id = (value: string) => value as ModuleItemId;

describe("shuffle", () => {
  test("keeps the same elements", () => {
    const result = shuffle([1, 2, 3, 4, 5], () => 0.5);
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  test("does not mutate the source", () => {
    const source = [1, 2, 3];
    shuffle(source, () => 0.5);
    expect(source).toEqual([1, 2, 3]);
  });
});

describe("sample", () => {
  test("returns the requested amount", () => {
    expect(sample([1, 2, 3, 4], 2, () => 0.5)).toHaveLength(2);
  });

  test("never exceeds the source length", () => {
    expect(sample([1, 2], 5, () => 0.5)).toHaveLength(2);
  });

  test("handles a negative count", () => {
    expect(sample([1, 2], -1, () => 0.5)).toHaveLength(0);
  });
});

describe("pickOne", () => {
  test("returns an element for a non-empty list", () => {
    expect(pickOne(["a", "b"], () => 0.5)).toBe("b");
  });

  test("returns undefined for an empty list", () => {
    expect(pickOne([], () => 0.5)).toBeUndefined();
  });

  test("clamps a random value of one", () => {
    expect(pickOne(["a", "b", "c"], () => 1)).toBe("c");
  });
});

describe("itemAccuracies", () => {
  test("aggregates results per item", () => {
    const result = itemAccuracies([
      { itemId: id("upper-a"), correct: true },
      { itemId: id("upper-a"), correct: false },
      { itemId: id("upper-b"), correct: true },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0]?.itemId).toBe(id("upper-a"));
    expect(result[0]?.accuracy).toBe(0.5);
    expect(result[0]?.attempts).toBe(2);
    expect(result[1]?.itemId).toBe(id("upper-b"));
    expect(result[1]?.accuracy).toBe(1);
    expect(result[1]?.attempts).toBe(1);
  });

  test("returns an empty list for no results", () => {
    expect(itemAccuracies([])).toEqual([]);
  });
});
