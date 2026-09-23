import { describe, expect, test } from "bun:test";
import { LOCALES, type Locale } from "../domain";
import { GLYPH_ITEMS } from "./glyphs";
import { itemPhoneme, PHONEMES, phonemeFor } from "./phonemes";

describe("phoneme catalog", () => {
  test("covers every glyph item", () => {
    const missing = GLYPH_ITEMS.filter((item) => !PHONEMES[item.id]).map(
      (item) => item.id,
    );
    expect(missing).toEqual([]);
  });

  test("has no orphan entries", () => {
    const ids = new Set(GLYPH_ITEMS.map((item) => item.id as string));
    const orphans = Object.keys(PHONEMES).filter((key) => !ids.has(key));
    expect(orphans).toEqual([]);
  });

  test("provides a non-empty name for every locale", () => {
    for (const [id, entry] of Object.entries(PHONEMES)) {
      for (const locale of LOCALES) {
        expect(`${id}.${locale}=${entry[locale]}`).not.toMatch(/=$/);
      }
    }
  });

  test("gives arabic a distinct name for every item", () => {
    for (const [id, entry] of Object.entries(PHONEMES)) {
      expect(`${id}.ar=${entry.ar}`).not.toBe(`${id}.ar=${entry.id}`);
      expect(`${id}.ar=${entry.ar}`).not.toBe(`${id}.ar=${entry.en}`);
    }
  });

  test("translates english for every item except shared letter names", () => {
    const shared = Object.entries(PHONEMES)
      .filter(([, entry]) => entry.en === entry.id)
      .map(([id]) => id)
      .sort();
    // "M"/"N" and "oval" are spelled identically in Indonesian and English.
    expect(shared).toEqual([
      "lower-m",
      "lower-n",
      "shape-oval",
      "upper-m",
      "upper-n",
    ]);
  });

  test("shares the letter name between upper and lower case", () => {
    for (const letter of "abcdefghijklmnopqrstuvwxyz") {
      expect(PHONEMES[`lower-${letter}`]).toEqual(
        PHONEMES[`upper-${letter}`],
      );
    }
  });

  test("phonemeFor returns undefined for unknown items and locales", () => {
    expect(phonemeFor("nope", "id")).toBeUndefined();
    expect(phonemeFor("upper-a", "id")).toBe("a");
  });

  test("itemPhoneme falls back to the item default", () => {
    const item = GLYPH_ITEMS.find((entry) => entry.id === "upper-b")!;
    expect(itemPhoneme(item, "en")).toBe("bee");
    const unknown = { ...item, id: "ghost" as typeof item.id, phoneme: "fallback" };
    expect(itemPhoneme(unknown, "ar" as Locale)).toBe("fallback");
  });
});
