import Dexie, { type Table } from "dexie";
import type {
  AvatarConfig,
  MasteryScore,
  Profile,
  Reward,
  ScreenTimeSetting,
  TraceAttempt,
} from "../domain";

export interface SettingRow {
  readonly key: string;
  readonly value: unknown;
}

export interface AvatarRecord {
  readonly profileId: string;
  readonly config: AvatarConfig;
}

export type StoreSpec = string | null;

export interface DbVersion {
  readonly version: number;
  readonly stores: Readonly<Record<string, StoreSpec>>;
}

/**
 * IndexedDB cannot change an existing store's primary key, so a schema bump
 * must delete the old store and create a new one instead.
 */
export const DB_VERSIONS: readonly DbVersion[] = [
  {
    version: 1,
    stores: {
      profiles: "id, createdAt",
      screenTime: "profileId",
      attempts: "id, profileId, itemId, completedAt",
      mastery: "[profileId+itemId], profileId",
      rewards: "id, kind, unlockedAt",
      settings: "key",
    },
  },
  {
    version: 2,
    stores: {
      rewards: null,
      profileRewards: "[profileId+id], profileId, kind, unlockedAt",
      avatars: "profileId",
    },
  },
];

export const primaryKeyOf = (spec: string): string => {
  const [first = ""] = spec.split(",");
  return first.trim();
};

export const findPrimaryKeyChanges = (
  versions: readonly DbVersion[] = DB_VERSIONS,
): string[] => {
  const seen = new Map<string, string>();
  const issues: string[] = [];

  for (const { version, stores } of versions) {
    for (const [name, spec] of Object.entries(stores)) {
      if (spec === null) {
        seen.delete(name);
        continue;
      }
      const key = primaryKeyOf(spec);
      const previous = seen.get(name);
      if (previous !== undefined && previous !== key) {
        issues.push(`v${version} ${name}: ${previous} -> ${key}`);
      }
      seen.set(name, key);
    }
  }

  return issues;
};

export class AksarakuDb extends Dexie {
  profiles!: Table<Profile, string>;
  screenTime!: Table<ScreenTimeSetting, string>;
  attempts!: Table<TraceAttempt, string>;
  mastery!: Table<MasteryScore, [string, string]>;
  profileRewards!: Table<Reward, [string, string]>;
  avatars!: Table<AvatarRecord, string>;
  settings!: Table<SettingRow, string>;

  constructor() {
    super("aksaraku");
    for (const { version, stores } of DB_VERSIONS) {
      this.version(version).stores({ ...stores });
    }
  }
}

export const db = new AksarakuDb();

export const resetDatabase = async (): Promise<void> => {
  db.close();
  await Dexie.delete("aksaraku");
};
