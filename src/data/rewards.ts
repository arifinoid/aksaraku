import type {
  Locale,
  RewardDefinition,
  RewardId,
  RewardKind,
  RewardRequirement,
} from "../domain";

const names = (
  id: string,
  en: string,
  ar: string,
): Readonly<Record<Locale, string>> => ({ id, en, ar });

const reward = (
  id: string,
  kind: RewardKind,
  emoji: string,
  localized: Readonly<Record<Locale, string>>,
  requirement: RewardRequirement,
): RewardDefinition => ({
  id: id as RewardId,
  kind,
  emoji,
  names: localized,
  requirement,
});

export const REWARDS: readonly RewardDefinition[] = [
  reward("sticker-star", "sticker", "⭐", names("Bintang", "Star", "نجمة"), {
    _tag: "ItemsAttempted",
    count: 1,
  }),
  reward("sticker-heart", "sticker", "❤️", names("Hati", "Heart", "قلب"), {
    _tag: "ItemsAttempted",
    count: 3,
  }),
  reward("sticker-rainbow", "sticker", "🌈", names("Pelangi", "Rainbow", "قوس قزح"), {
    _tag: "StarsEarned",
    count: 3,
  }),
  reward("sticker-flower", "sticker", "🌸", names("Bunga", "Flower", "زهرة"), {
    _tag: "StarsEarned",
    count: 6,
  }),
  reward("sticker-butterfly", "sticker", "🦋", names("Kupu-kupu", "Butterfly", "فراشة"), {
    _tag: "ItemsMastered",
    count: 3,
  }),
  reward("sticker-balloon", "sticker", "🎈", names("Balon", "Balloon", "بالون"), {
    _tag: "ItemsMastered",
    count: 5,
  }),
  reward("trophy-bronze", "trophy", "🥉", names("Piala Perunggu", "Bronze Trophy", "كأس برونزي"), {
    _tag: "KindMastered",
    kind: "letter-upper",
    count: 5,
  }),
  reward("trophy-silver", "trophy", "🥈", names("Piala Perak", "Silver Trophy", "كأس فضي"), {
    _tag: "KindMastered",
    kind: "letter-lower",
    count: 5,
  }),
  reward("trophy-gold", "trophy", "🥇", names("Piala Emas", "Gold Trophy", "كأس ذهبي"), {
    _tag: "KindMastered",
    kind: "digit",
    count: 5,
  }),
  reward("trophy-star", "trophy", "🌟", names("Bintang Emas", "Gold Star", "نجمة ذهبية"), {
    _tag: "KindMastered",
    kind: "shape",
    count: 4,
  }),
  reward("trophy-crown", "trophy", "👑", names("Mahkota", "Crown", "تاج"), {
    _tag: "ItemsMastered",
    count: 15,
  }),
  reward("character-cat", "character", "🐱", names("Kucing", "Cat", "قطة"), {
    _tag: "ItemsAttempted",
    count: 2,
  }),
  reward("character-bear", "character", "🐻", names("Beruang", "Bear", "دب"), {
    _tag: "StarsEarned",
    count: 5,
  }),
  reward("character-fox", "character", "🦊", names("Rubah", "Fox", "ثعلب"), {
    _tag: "ItemsMastered",
    count: 8,
  }),
  reward("character-panda", "character", "🐼", names("Panda", "Panda", "باندا"), {
    _tag: "TotalAttempts",
    count: 25,
  }),
];

export const findReward = (rewardId: string): RewardDefinition | undefined =>
  REWARDS.find((entry) => entry.id === rewardId);

export const rewardsByKind = (kind: RewardKind): readonly RewardDefinition[] =>
  REWARDS.filter((entry) => entry.kind === kind);
