import type {
  AvatarPart,
  AvatarSlot,
  Locale,
  RewardId,
} from "../domain";

const names = (
  id: string,
  en: string,
  ar: string,
): Readonly<Record<Locale, string>> => ({ id, en, ar });

const part = (
  id: string,
  slot: AvatarSlot,
  value: string,
  localized: Readonly<Record<Locale, string>>,
  unlockRewardId?: string,
): AvatarPart => ({
  id,
  slot,
  value,
  names: localized,
  unlockRewardId: unlockRewardId as RewardId | undefined,
});

export const AVATAR_PARTS: readonly AvatarPart[] = [
  part("color-orange", "color", "#ff7a45", names("Oranye", "Orange", "برتقالي")),
  part("color-blue", "color", "#4cc9f0", names("Biru", "Blue", "أزرق")),
  part("color-green", "color", "#57cc99", names("Hijau", "Green", "أخضر")),
  part(
    "color-pink",
    "color",
    "#f15bb5",
    names("Merah Muda", "Pink", "وردي"),
    "sticker-rainbow",
  ),
  part(
    "color-purple",
    "color",
    "#9b5de5",
    names("Ungu", "Purple", "بنفسجي"),
    "trophy-silver",
  ),
  part(
    "color-yellow",
    "color",
    "#ffd166",
    names("Kuning", "Yellow", "أصفر"),
    "trophy-gold",
  ),

  part("ears-round", "ears", "round", names("Bulat", "Round", "دائري")),
  part("ears-pointy", "ears", "pointy", names("Runcing", "Pointy", "مدبّب")),
  part(
    "ears-floppy",
    "ears",
    "floppy",
    names("Terkulai", "Floppy", "متدلّي"),
    "sticker-heart",
  ),
  part(
    "ears-horn",
    "ears",
    "horn",
    names("Tanduk", "Horn", "قرن"),
    "trophy-bronze",
  ),

  part("eyes-dot", "eyes", "dot", names("Bulat Kecil", "Dot", "نقطة")),
  part("eyes-happy", "eyes", "happy", names("Ceria", "Happy", "سعيد")),
  part(
    "eyes-sparkle",
    "eyes",
    "sparkle",
    names("Berkilau", "Sparkle", "لامع"),
    "sticker-butterfly",
  ),

  part("accessory-none", "accessory", "none", names("Tanpa", "None", "بدون")),
  part(
    "accessory-hat",
    "accessory",
    "hat",
    names("Topi", "Hat", "قبعة"),
    "character-cat",
  ),
  part(
    "accessory-bow",
    "accessory",
    "bow",
    names("Pita", "Bow", "شريطة"),
    "character-bear",
  ),
  part(
    "accessory-glasses",
    "accessory",
    "glasses",
    names("Kacamata", "Glasses", "نظارة"),
    "character-fox",
  ),
  part(
    "accessory-crown",
    "accessory",
    "crown",
    names("Mahkota", "Crown", "تاج"),
    "character-panda",
  ),
];
