import { describe, expect, test } from "bun:test";
import type { MasteryScore, ModuleItemId, ProfileId } from "./types";
import { masteryLevel, updateMastery } from "./progress";

const profileId = "p1" as ProfileId;
const itemId = "letter-a" as ModuleItemId;

describe("updateMastery", () => {
  test("starts from the first accuracy", () => {
    const result = updateMastery(undefined, profileId, itemId, 0.8, 100);
    expect(result.score).toBeCloseTo(0.8);
    expect(result.attempts).toBe(1);
    expect(result.lastSeenAt).toBe(100);
  });

  test("applies an exponential moving average", () => {
    const previous: MasteryScore = {
      profileId,
      itemId,
      score: 0.5,
      attempts: 3,
      lastSeenAt: 100,
    };
    const result = updateMastery(previous, profileId, itemId, 1, 200);

    expect(result.score).toBeCloseTo(0.5 * 0.7 + 1 * 0.3);
    expect(result.attempts).toBe(4);
    expect(result.lastSeenAt).toBe(200);
  });
});

describe("masteryLevel", () => {
  test("treats unseen items as new", () => {
    expect(masteryLevel(undefined, 0)).toBe("new");
    expect(masteryLevel(0.9, 0)).toBe("new");
  });

  test("buckets by score", () => {
    expect(masteryLevel(0.95, 1)).toBe("mastered");
    expect(masteryLevel(0.8, 1)).toBe("familiar");
    expect(masteryLevel(0.5, 1)).toBe("learning");
  });
});
