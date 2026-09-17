import type { Locale, RewardId } from "./types";

export type AvatarSlot = "color" | "ears" | "eyes" | "accessory";

export const AVATAR_SLOTS: readonly AvatarSlot[] = [
  "color",
  "ears",
  "eyes",
  "accessory",
];

export interface AvatarPart {
  readonly id: string;
  readonly slot: AvatarSlot;
  readonly names: Readonly<Record<Locale, string>>;
  readonly value: string;
  readonly unlockRewardId?: RewardId;
}

export type AvatarConfig = Readonly<Record<AvatarSlot, string>>;

export interface ResolvedAvatar {
  readonly color: AvatarPart | undefined;
  readonly ears: AvatarPart | undefined;
  readonly eyes: AvatarPart | undefined;
  readonly accessory: AvatarPart | undefined;
}

export const partById = (
  parts: readonly AvatarPart[],
  id: string,
): AvatarPart | undefined => parts.find((part) => part.id === id);

export const partsForSlot = (
  parts: readonly AvatarPart[],
  slot: AvatarSlot,
): readonly AvatarPart[] => parts.filter((part) => part.slot === slot);

const firstPartId = (
  parts: readonly AvatarPart[],
  slot: AvatarSlot,
): string => partsForSlot(parts, slot)[0]?.id ?? "";

export const defaultAvatarConfig = (
  parts: readonly AvatarPart[],
): AvatarConfig => ({
  color: firstPartId(parts, "color"),
  ears: firstPartId(parts, "ears"),
  eyes: firstPartId(parts, "eyes"),
  accessory: firstPartId(parts, "accessory"),
});

export const isPartUnlocked = (
  part: AvatarPart,
  unlockedRewardIds: readonly RewardId[],
): boolean =>
  part.unlockRewardId === undefined ||
  unlockedRewardIds.includes(part.unlockRewardId);

export const selectPart = (
  config: AvatarConfig,
  part: AvatarPart,
  unlockedRewardIds: readonly RewardId[],
): AvatarConfig | undefined =>
  isPartUnlocked(part, unlockedRewardIds)
    ? { ...config, [part.slot]: part.id }
    : undefined;

export const resolveAvatar = (
  config: AvatarConfig,
  parts: readonly AvatarPart[],
): ResolvedAvatar => ({
  color: partById(parts, config.color),
  ears: partById(parts, config.ears),
  eyes: partById(parts, config.eyes),
  accessory: partById(parts, config.accessory),
});

export const avatarPartName = (part: AvatarPart, locale: Locale): string =>
  part.names[locale] ?? part.names.en;
