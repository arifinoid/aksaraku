import { describe, expect, test } from "bun:test";
import type { MasteryScore, ModuleItemId, ModuleKind, ProfileId } from "./types";
import {
  emptyStats,
  meetsRequirement,
  newlyUnlocked,
  requirementProgress,
  statsFromMastery,
  type RewardDefinition,
  type RewardRequirement,
} from "./rewards";

const profileId = "p1" as ProfileId;
const itemId = (value: string) => value as ModuleItemId;

const score = (
  id: string,
  value: number,
  attempts = 3,
): MasteryScore => ({
  profileId,
  itemId: itemId(id),
  score: value,
  attempts,
  lastSeenAt: 100,
});

const KIND_BY_ITEM = new Map<string, ModuleKind>([
  ["upper-a", "letter-upper"],
  ["upper-b", "letter-upper"],
  ["digit-1", "digit"],
  ["shape-line", "shape"],
]);

const definition = (
  id: string,
  requirement: RewardRequirement,
): RewardDefinition => ({
  id: id as RewardDefinition["id"],
  kind: "sticker",
  emoji: "⭐",
  names: { id: "x", en: "x", ar: "x" },
  requirement,
});

describe("statsFromMastery", () => {
  test("is empty without mastery", () => {
    expect(statsFromMastery({ mastery: [], kindByItemId: KIND_BY_ITEM })).toEqual(
      emptyStats,
    );
  });

  test("counts attempts, mastered items, stars, and kinds", () => {
    const stats = statsFromMastery({
      mastery: [score("upper-a", 0.95), score("upper-b", 0.6), score("digit-1", 0.92)],
      kindByItemId: KIND_BY_ITEM,
    });

    expect(stats.itemsAttempted).toBe(3);
    expect(stats.itemsMastered).toBe(2);
    expect(stats.totalAttempts).toBe(9);
    expect(stats.starsEarned).toBe(3 + 1 + 2);
    expect(stats.masteredByKind["letter-upper"]).toBe(1);
    expect(stats.masteredByKind["digit"]).toBe(1);
    expect(stats.masteredByKind["shape"]).toBe(0);
  });

  test("ignores items without a known kind when bucketing", () => {
    const stats = statsFromMastery({
      mastery: [score("unknown", 1)],
      kindByItemId: KIND_BY_ITEM,
    });
    expect(stats.itemsMastered).toBe(1);
    expect(stats.masteredByKind["letter-upper"]).toBe(0);
  });
});

describe("requirementProgress", () => {
  test("reads the matching stat", () => {
    const stats = {
      ...emptyStats,
      itemsMastered: 4,
      masteredByKind: { ...emptyStats.masteredByKind, digit: 2 },
    };
    expect(
      requirementProgress({ _tag: "ItemsMastered", count: 5 }, stats),
    ).toEqual({ current: 4, target: 5 });
    expect(
      requirementProgress(
        { _tag: "KindMastered", kind: "digit", count: 5 },
        stats,
      ),
    ).toEqual({ current: 2, target: 5 });
  });
});

describe("meetsRequirement", () => {
  test("compares current against target", () => {
    const stats = { ...emptyStats, itemsAttempted: 3 };
    expect(
      meetsRequirement({ _tag: "ItemsAttempted", count: 3 }, stats),
    ).toBe(true);
    expect(
      meetsRequirement({ _tag: "ItemsAttempted", count: 4 }, stats),
    ).toBe(false);
  });
});

describe("newlyUnlocked", () => {
  const definitions = [
    definition("a", { _tag: "ItemsAttempted", count: 1 }),
    definition("b", { _tag: "ItemsAttempted", count: 5 }),
    definition("c", { _tag: "StarsEarned", count: 2 }),
  ];

  test("returns only definitions not owned and satisfied", () => {
    const stats = { ...emptyStats, itemsAttempted: 2, starsEarned: 3 };
    const result = newlyUnlocked(definitions, [], stats);
    expect(result.map((entry) => String(entry.id))).toEqual(["a", "c"]);
  });

  test("skips already owned rewards", () => {
    const stats = { ...emptyStats, itemsAttempted: 6, starsEarned: 3 };
    const result = newlyUnlocked(
      definitions,
      [definitions[0]!.id, definitions[2]!.id],
      stats,
    );
    expect(result.map((entry) => String(entry.id))).toEqual(["b"]);
  });

  test("returns nothing when no requirement is met", () => {
    expect(newlyUnlocked(definitions, [], emptyStats)).toEqual([]);
  });
});
