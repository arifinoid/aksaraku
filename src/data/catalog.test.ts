import { describe, expect, test } from "bun:test";
import { AVATAR_SLOTS, type Locale } from "../domain";
import { AVATAR_PARTS } from "./avatarParts";
import { REWARDS } from "./rewards";

const LOCALES: readonly Locale[] = ["id", "en", "ar"];
const REWARD_IDS = new Set(REWARDS.map((reward) => String(reward.id)));

describe("reward catalog", () => {
  test("uses unique ids", () => {
    const ids = REWARDS.map((reward) => String(reward.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("covers every kind", () => {
    const kinds = new Set(REWARDS.map((reward) => reward.kind));
    expect(kinds).toEqual(new Set(["sticker", "trophy", "character"]));
  });

  test("names and emoji are present for every locale", () => {
    for (const reward of REWARDS) {
      expect(reward.emoji.length).toBeGreaterThan(0);
      for (const locale of LOCALES) {
        expect(reward.names[locale].length).toBeGreaterThan(0);
      }
    }
  });

  test("requires a positive count", () => {
    for (const reward of REWARDS) {
      expect(reward.requirement.count).toBeGreaterThan(0);
    }
  });
});

describe("avatar part catalog", () => {
  test("uses unique ids", () => {
    const ids = AVATAR_PARTS.map((part) => part.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("uses known slots and non-empty values", () => {
    for (const part of AVATAR_PARTS) {
      expect(AVATAR_SLOTS).toContain(part.slot);
      expect(part.value.length).toBeGreaterThan(0);
    }
  });

  test("names are present for every locale", () => {
    for (const part of AVATAR_PARTS) {
      for (const locale of LOCALES) {
        expect(part.names[locale].length).toBeGreaterThan(0);
      }
    }
  });

  test("every slot has at least one free part", () => {
    for (const slot of AVATAR_SLOTS) {
      const free = AVATAR_PARTS.filter(
        (part) => part.slot === slot && part.unlockRewardId === undefined,
      );
      expect(free.length).toBeGreaterThan(0);
    }
  });

  test("unlock rewards reference real rewards", () => {
    for (const part of AVATAR_PARTS) {
      if (part.unlockRewardId === undefined) continue;
      expect(REWARD_IDS.has(String(part.unlockRewardId))).toBe(true);
    }
  });

  test("color parts use hex values", () => {
    for (const part of AVATAR_PARTS.filter((entry) => entry.slot === "color")) {
      expect(part.value).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
