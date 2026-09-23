export type Locale = "id" | "en" | "ar";

export type ProfileId = string & { readonly _brand: "ProfileId" };
export type ModuleItemId = string & { readonly _brand: "ModuleItemId" };
export type RewardId = string & { readonly _brand: "RewardId" };
export type AvatarId = string & { readonly _brand: "AvatarId" };

export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

export type ModuleKind = "letter-upper" | "letter-lower" | "digit" | "shape";

export type StrokeDirection = "ltr" | "rtl" | "ttb" | "btt" | "curve";

export interface StrokePath {
  readonly points: readonly Vec2[];
  /** Finger tolerance in screen pixels; scaled to design space at trace time. */
  readonly tolerance: number;
  readonly guideOrder: number;
  readonly direction: StrokeDirection;
}

export interface ModuleItem {
  readonly id: ModuleItemId;
  readonly kind: ModuleKind;
  readonly glyph: string;
  readonly strokes: readonly StrokePath[];
  readonly phoneme: string;
  readonly locale: Locale;
  readonly labelKey: string;
}

export interface Profile {
  readonly id: ProfileId;
  readonly name: string;
  readonly avatarId: AvatarId;
  readonly locale: Locale;
  readonly createdAt: number;
}

export interface AppSettings {
  readonly locale: Locale;
  readonly hapticsEnabled: boolean;
  readonly audioEnabled: boolean;
  readonly reduceMotion: boolean;
}

export interface ScreenTimeSetting {
  readonly profileId: ProfileId;
  readonly sessionLimitMin: number;
  readonly breakReminderMin: number;
}

export interface TraceAttempt {
  readonly id: string;
  readonly profileId: ProfileId;
  readonly itemId: ModuleItemId;
  readonly accuracy: number;
  readonly deviationAvg: number;
  readonly durationMs: number;
  readonly completedAt: number;
}

export interface MasteryScore {
  readonly profileId: ProfileId;
  readonly itemId: ModuleItemId;
  readonly score: number;
  readonly attempts: number;
  readonly lastSeenAt: number;
}

export type RewardKind = "sticker" | "trophy" | "character";

export interface Reward {
  readonly profileId: ProfileId;
  readonly id: RewardId;
  readonly kind: RewardKind;
  readonly unlockedAt: number;
}
