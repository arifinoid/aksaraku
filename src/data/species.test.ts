import { describe, expect, test } from "bun:test";
import { AVATAR_PARTS } from "./avatarParts";
import { AVATAR_OPTIONS } from "./avatars";
import { DEFAULT_SPECIES, defaultAvatarFor, speciesLook } from "./species";

describe("avatar species", () => {
  test("every avatar emoji has a species look", () => {
    for (const option of AVATAR_OPTIONS) {
      expect(speciesLook(option.id).fur).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  test("an unknown id falls back to the default species", () => {
    expect(speciesLook("dragon")).toEqual(speciesLook(DEFAULT_SPECIES));
  });

  test("a new profile starts on parts that exist", () => {
    for (const option of AVATAR_OPTIONS) {
      const config = defaultAvatarFor(AVATAR_PARTS, option.id);
      expect(AVATAR_PARTS.some((part) => part.id === config.color)).toBe(true);
      expect(AVATAR_PARTS.some((part) => part.id === config.ears)).toBe(true);
    }
  });

  test("the starting fur is the species colour", () => {
    for (const option of AVATAR_OPTIONS) {
      const look = speciesLook(option.id);
      const config = defaultAvatarFor(AVATAR_PARTS, option.id);
      const color = AVATAR_PARTS.find((part) => part.id === config.color);
      expect(color?.value.toLowerCase()).toBe(look.fur.toLowerCase());
    }
  });

  test("the starting ears are the species ears", () => {
    for (const option of AVATAR_OPTIONS) {
      const look = speciesLook(option.id);
      expect(defaultAvatarFor(AVATAR_PARTS, option.id).ears).toBe(look.ears);
    }
  });
});
