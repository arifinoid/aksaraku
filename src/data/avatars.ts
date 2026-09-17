import type { AvatarId } from "../domain";

export interface AvatarOption {
  readonly id: AvatarId;
  readonly emoji: string;
}

export const AVATAR_OPTIONS: readonly AvatarOption[] = [
  { id: "cat" as AvatarId, emoji: "🐱" },
  { id: "bear" as AvatarId, emoji: "🐻" },
  { id: "rabbit" as AvatarId, emoji: "🐰" },
  { id: "fox" as AvatarId, emoji: "🦊" },
  { id: "panda" as AvatarId, emoji: "🐼" },
  { id: "frog" as AvatarId, emoji: "🐸" },
];

export const DEFAULT_AVATAR_ID: AvatarId = "cat" as AvatarId;

export const avatarEmoji = (id: AvatarId): string =>
  AVATAR_OPTIONS.find((option) => option.id === id)?.emoji ?? "🐱";
