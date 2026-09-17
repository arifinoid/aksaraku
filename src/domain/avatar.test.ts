import { describe, expect, test } from "bun:test";
import type { AvatarPart } from "./avatar";
import type { RewardId } from "./types";
import {
  avatarPartName,
  defaultAvatarConfig,
  isPartUnlocked,
  partById,
  partsForSlot,
  resolveAvatar,
  selectPart,
} from "./avatar";

const names = { id: "n", en: "n", ar: "n" };

const PARTS: readonly AvatarPart[] = [
  { id: "color-a", slot: "color", value: "#111", names },
  { id: "color-b", slot: "color", value: "#222", names },
  { id: "ears-a", slot: "ears", value: "round", names },
  {
    id: "ears-b",
    slot: "ears",
    value: "horn",
    names,
    unlockRewardId: "trophy-bronze" as RewardId,
  },
  { id: "eyes-a", slot: "eyes", value: "dot", names },
  { id: "accessory-a", slot: "accessory", value: "none", names },
];

describe("partsForSlot", () => {
  test("filters by slot", () => {
    expect(partsForSlot(PARTS, "color")).toHaveLength(2);
    expect(partsForSlot(PARTS, "ears")).toHaveLength(2);
  });
});

describe("defaultAvatarConfig", () => {
  test("picks the first part of every slot", () => {
    expect(defaultAvatarConfig(PARTS)).toEqual({
      color: "color-a",
      ears: "ears-a",
      eyes: "eyes-a",
      accessory: "accessory-a",
    });
  });

  test("uses empty strings when a slot has no parts", () => {
    const config = defaultAvatarConfig([PARTS[0]!]);
    expect(config.ears).toBe("");
    expect(config.eyes).toBe("");
  });
});

describe("isPartUnlocked", () => {
  test("free parts are always unlocked", () => {
    expect(isPartUnlocked(PARTS[0]!, [])).toBe(true);
  });

  test("locked parts need their reward", () => {
    const locked = PARTS[3]!;
    expect(isPartUnlocked(locked, [])).toBe(false);
    expect(isPartUnlocked(locked, ["trophy-bronze" as RewardId])).toBe(true);
  });
});

describe("selectPart", () => {
  test("swaps the part for its slot", () => {
    const config = defaultAvatarConfig(PARTS);
    const next = selectPart(config, PARTS[1]!, []);
    expect(next?.color).toBe("color-b");
    expect(next?.ears).toBe("ears-a");
  });

  test("refuses locked parts", () => {
    const config = defaultAvatarConfig(PARTS);
    expect(selectPart(config, PARTS[3]!, [])).toBeUndefined();
  });
});

describe("resolveAvatar", () => {
  test("maps config ids back to parts", () => {
    const resolved = resolveAvatar(defaultAvatarConfig(PARTS), PARTS);
    expect(resolved.color?.value).toBe("#111");
    expect(resolved.ears?.value).toBe("round");
    expect(resolved.accessory?.value).toBe("none");
  });

  test("returns undefined for unknown ids", () => {
    const resolved = resolveAvatar(
      { color: "nope", ears: "nope", eyes: "nope", accessory: "nope" },
      PARTS,
    );
    expect(resolved.color).toBeUndefined();
    expect(partById(PARTS, "nope")).toBeUndefined();
  });
});

describe("avatarPartName", () => {
  test("falls back to english", () => {
    const part: AvatarPart = {
      id: "x",
      slot: "color",
      value: "#000",
      names: { id: "Warna", en: "Color", ar: "لون" },
    };
    expect(avatarPartName(part, "id")).toBe("Warna");
    expect(avatarPartName(part, "en")).toBe("Color");
  });
});
