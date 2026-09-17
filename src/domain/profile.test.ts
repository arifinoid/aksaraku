import { describe, expect, test } from "bun:test";
import * as E from "fp-ts/Either";
import {
  createProfile,
  MAX_NAME_LENGTH,
  normalizeName,
  profileErrorMessageKey,
  validateName,
} from "./profile";
import type { AvatarId, ProfileId } from "./types";

const asProfileId = (value: string) => value as ProfileId;
const asAvatarId = (value: string) => value as AvatarId;

describe("normalizeName", () => {
  test("trims and collapses whitespace", () => {
    expect(normalizeName("  Aisyah   Putri ")).toBe("Aisyah Putri");
  });
});

describe("validateName", () => {
  test("rejects empty name", () => {
    const result = validateName("   ");
    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) expect(result.left._tag).toBe("EmptyName");
  });

  test("rejects too long name", () => {
    const result = validateName("a".repeat(MAX_NAME_LENGTH + 1));
    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) expect(result.left._tag).toBe("NameTooLong");
  });

  test("accepts valid name", () => {
    const result = validateName("Aisyah");
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) expect(result.right).toBe("Aisyah");
  });
});

describe("createProfile", () => {
  test("builds a profile from valid input", () => {
    const result = createProfile({
      id: asProfileId("p1"),
      name: "  Aisyah ",
      avatarId: asAvatarId("avatar-1"),
      locale: "id",
      createdAt: 100,
    });

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right.id).toBe(asProfileId("p1"));
      expect(result.right.name).toBe("Aisyah");
      expect(result.right.avatarId).toBe(asAvatarId("avatar-1"));
      expect(result.right.locale).toBe("id");
      expect(result.right.createdAt).toBe(100);
    }
  });

  test("fails when locale is unknown", () => {
    const result = createProfile({
      id: asProfileId("p1"),
      name: "Aisyah",
      avatarId: asAvatarId("avatar-1"),
      locale: "jp",
      createdAt: 100,
    });

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(profileErrorMessageKey(result.left)).toBe(
        "profile.errors.invalidLocale",
      );
    }
  });
});
