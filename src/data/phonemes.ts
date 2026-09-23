import type { Locale, ModuleItem } from "../domain";

type Names = Readonly<Record<Locale, string>>;

const names = (id: string, en: string, ar: string): Names => ({ id, en, ar });

/** Spoken name of each letter, per language. */
const LETTERS: Readonly<Record<string, Names>> = {
  A: names("a", "ay", "إيه"),
  B: names("be", "bee", "بي"),
  C: names("ce", "see", "سي"),
  D: names("de", "dee", "دي"),
  E: names("e", "ee", "إي"),
  F: names("ef", "eff", "إف"),
  G: names("ge", "gee", "جي"),
  H: names("ha", "aitch", "إتش"),
  I: names("i", "eye", "آي"),
  J: names("je", "jay", "جاي"),
  K: names("ka", "kay", "كاي"),
  L: names("el", "ell", "إل"),
  M: names("em", "em", "إم"),
  N: names("en", "en", "إن"),
  O: names("o", "oh", "أو"),
  P: names("pe", "pee", "بيه"),
  Q: names("ki", "cue", "كيو"),
  R: names("er", "arr", "آر"),
  S: names("es", "ess", "إس"),
  T: names("te", "tee", "تي"),
  U: names("u", "you", "يو"),
  V: names("ve", "vee", "في"),
  W: names("we", "double you", "دبل يو"),
  X: names("eks", "ex", "إكس"),
  Y: names("ye", "why", "واي"),
  Z: names("zet", "zee", "زد"),
};

const DIGITS: readonly Names[] = [
  names("nol", "zero", "صفر"),
  names("satu", "one", "واحد"),
  names("dua", "two", "اثنان"),
  names("tiga", "three", "ثلاثة"),
  names("empat", "four", "أربعة"),
  names("lima", "five", "خمسة"),
  names("enam", "six", "ستة"),
  names("tujuh", "seven", "سبعة"),
  names("delapan", "eight", "ثمانية"),
  names("sembilan", "nine", "تسعة"),
];

const SHAPES: Readonly<Record<string, Names>> = {
  "shape-circle": names("lingkaran", "circle", "دائرة"),
  "shape-oval": names("oval", "oval", "بيضاوي"),
  "shape-square": names("persegi", "square", "مربع"),
  "shape-rectangle": names("persegi panjang", "rectangle", "مستطيل"),
  "shape-triangle": names("segitiga", "triangle", "مثلث"),
  "shape-star": names("bintang", "star", "نجمة"),
  "shape-heart": names("hati", "heart", "قلب"),
  "shape-line": names("garis", "line", "خط"),
};

const buildTable = (): Readonly<Record<string, Names>> => {
  const table: Record<string, Names> = { ...SHAPES };

  for (const [letter, entry] of Object.entries(LETTERS)) {
    const key = letter.toLowerCase();
    table[`upper-${key}`] = entry;
    table[`lower-${key}`] = entry;
  }

  DIGITS.forEach((entry, index) => {
    table[`digit-${index}`] = entry;
  });

  return table;
};

/** Localized spoken name for every module item, keyed by item id. */
export const PHONEMES: Readonly<Record<string, Names>> = buildTable();

export const phonemeFor = (itemId: string, locale: Locale): string | undefined =>
  PHONEMES[itemId]?.[locale];

/** Falls back to the item's own (Indonesian) phoneme when a locale is missing. */
export const itemPhoneme = (item: ModuleItem, locale: Locale): string =>
  phonemeFor(item.id, locale) ?? item.phoneme;
