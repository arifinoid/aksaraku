import Dexie, { type Table } from "dexie";
import type {
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

export class AksarakuDb extends Dexie {
  profiles!: Table<Profile, string>;
  screenTime!: Table<ScreenTimeSetting, string>;
  attempts!: Table<TraceAttempt, string>;
  mastery!: Table<MasteryScore, [string, string]>;
  rewards!: Table<Reward, string>;
  settings!: Table<SettingRow, string>;

  constructor() {
    super("aksaraku");
    this.version(1).stores({
      profiles: "id, createdAt",
      screenTime: "profileId",
      attempts: "id, profileId, itemId, completedAt",
      mastery: "[profileId+itemId], profileId",
      rewards: "id, kind, unlockedAt",
      settings: "key",
    });
  }
}

export const db = new AksarakuDb();
