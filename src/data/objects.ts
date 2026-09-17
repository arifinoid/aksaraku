import type { Locale, ModuleItem } from "../domain";

export interface ObjectEntry {
  readonly emoji: string;
  readonly names: Readonly<Record<Locale, string>>;
}

export const OBJECTS: Readonly<Record<string, ObjectEntry>> = {
  A: { emoji: "🍎", names: { id: "Apel", en: "Apple", ar: "تفاحة" } },
  B: { emoji: "⚽", names: { id: "Bola", en: "Ball", ar: "كرة" } },
  C: { emoji: "🌶️", names: { id: "Cabai", en: "Chili", ar: "فلفل حار" } },
  D: { emoji: "🐑", names: { id: "Domba", en: "Sheep", ar: "خروف" } },
  E: { emoji: "🍦", names: { id: "Es Krim", en: "Ice cream", ar: "آيس كريم" } },
  F: { emoji: "🦩", names: { id: "Flamingo", en: "Flamingo", ar: "فلامنغو" } },
  G: { emoji: "🐘", names: { id: "Gajah", en: "Elephant", ar: "فيل" } },
  H: { emoji: "🐯", names: { id: "Harimau", en: "Tiger", ar: "نمر" } },
  I: { emoji: "🐟", names: { id: "Ikan", en: "Fish", ar: "سمكة" } },
  J: { emoji: "🍊", names: { id: "Jeruk", en: "Orange", ar: "برتقالة" } },
  K: { emoji: "🐱", names: { id: "Kucing", en: "Cat", ar: "قطة" } },
  L: { emoji: "💡", names: { id: "Lampu", en: "Lamp", ar: "مصباح" } },
  M: { emoji: "👁️", names: { id: "Mata", en: "Eye", ar: "عين" } },
  N: { emoji: "🍍", names: { id: "Nanas", en: "Pineapple", ar: "أناناس" } },
  O: { emoji: "🌊", names: { id: "Ombak", en: "Wave", ar: "موجة" } },
  P: { emoji: "🍌", names: { id: "Pisang", en: "Banana", ar: "موز" } },
  Q: { emoji: "📖", names: { id: "Quran", en: "Quran", ar: "قرآن" } },
  R: { emoji: "🍞", names: { id: "Roti", en: "Bread", ar: "خبز" } },
  S: { emoji: "🐄", names: { id: "Sapi", en: "Cow", ar: "بقرة" } },
  T: { emoji: "🎩", names: { id: "Topi", en: "Hat", ar: "قبعة" } },
  U: { emoji: "🐍", names: { id: "Ular", en: "Snake", ar: "ثعبان" } },
  V: { emoji: "🏺", names: { id: "Vas", en: "Vase", ar: "مزهرية" } },
  W: { emoji: "🥕", names: { id: "Wortel", en: "Carrot", ar: "جزرة" } },
  X: { emoji: "🎹", names: { id: "Xilofon", en: "Xylophone", ar: "زايلوفون" } },
  Y: { emoji: "🪀", names: { id: "Yoyo", en: "Yoyo", ar: "يويو" } },
  Z: { emoji: "🦓", names: { id: "Zebra", en: "Zebra", ar: "حمار وحشي" } },
};

export const objectEntry = (glyph: string): ObjectEntry | undefined =>
  OBJECTS[glyph.toUpperCase()];

export const objectEmojiByItemId = (
  items: readonly ModuleItem[],
): ReadonlyMap<string, string> => {
  const map = new Map<string, string>();
  for (const item of items) {
    if (item.kind !== "letter-upper") continue;
    const entry = objectEntry(item.glyph);
    if (entry) map.set(item.id, entry.emoji);
  }
  return map;
};

export const objectName = (
  item: ModuleItem,
  locale: Locale,
): string | undefined => objectEntry(item.glyph)?.names[locale];
