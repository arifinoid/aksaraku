import { describe, expect, test } from "bun:test";
import {
  DB_VERSIONS,
  findPrimaryKeyChanges,
  primaryKeyOf,
  type DbVersion,
} from "./db";

describe("primaryKeyOf", () => {
  test("reads the first token of a store spec", () => {
    expect(primaryKeyOf("id, kind, unlockedAt")).toBe("id");
    expect(primaryKeyOf("profileId")).toBe("profileId");
    expect(primaryKeyOf("[profileId+id], profileId, kind")).toBe("[profileId+id]");
  });
});

describe("db schema", () => {
  test("never changes an existing store's primary key", () => {
    expect(findPrimaryKeyChanges()).toEqual([]);
  });

  test("rewards became per profile without reusing the old store", () => {
    const migration = DB_VERSIONS.find(
      (entry) => entry.stores.profileRewards !== undefined,
    )!;
    expect(migration.stores.rewards).toBeNull();
    expect(primaryKeyOf(migration.stores.profileRewards as string)).toBe(
      "[profileId+id]",
    );
  });

  test("sessions are keyed by profile", () => {
    const latest = DB_VERSIONS.at(-1)!;
    expect(primaryKeyOf(latest.stores.sessions as string)).toBe("profileId");
  });

  test("detects a primary key change", () => {
    const broken: DbVersion[] = [
      { version: 1, stores: { rewards: "id, kind" } },
      { version: 2, stores: { rewards: "[profileId+id], kind" } },
    ];
    expect(findPrimaryKeyChanges(broken)).toEqual(["v2 rewards: id -> [profileId+id]"]);
  });

  test("allows delete then recreate with a new key", () => {
    const fine: DbVersion[] = [
      { version: 1, stores: { rewards: "id, kind" } },
      { version: 2, stores: { rewards: null } },
      { version: 3, stores: { rewards: "[profileId+id], kind" } },
    ];
    expect(findPrimaryKeyChanges(fine)).toEqual([]);
  });
});
