import { describe, expect, test } from "bun:test";
import { ar } from "./ar";
import { en } from "./en";
import { id } from "./id";
import type { Dict } from "./types";

type Flat = Readonly<Record<string, string>>;

const flatten = (value: unknown, prefix = ""): Flat => {
  if (typeof value === "string") return { [prefix]: value };
  if (value === null || typeof value !== "object") return {};

  const entries: Record<string, string> = {};
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    Object.assign(entries, flatten(child, path));
  }
  return entries;
};

const ID = flatten(id);
const EN = flatten(en);
const AR = flatten(ar);

const sorted = (value: Flat): string[] => Object.keys(value).sort();

/** Keys that are intentionally the same in every language. */
const LANGUAGE_NEUTRAL = new Set(["app.name"]);

describe("locale dictionaries", () => {
  test("have the exact same keys", () => {
    expect(sorted(EN)).toEqual(sorted(ID));
    expect(sorted(AR)).toEqual(sorted(ID));
  });

  test("never leave a value empty", () => {
    for (const [locale, dict] of [
      ["id", ID],
      ["en", EN],
      ["ar", AR],
    ] as const) {
      for (const [key, value] of Object.entries(dict)) {
        expect(`${locale}.${key}=${value}`).not.toMatch(/=$/);
        expect(value.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test("translate every user-facing string", () => {
    for (const [locale, dict] of [
      ["en", EN],
      ["ar", AR],
    ] as const) {
      const leftovers = Object.keys(ID).filter(
        (key) =>
          !LANGUAGE_NEUTRAL.has(key) &&
          dict[key] === ID[key] &&
          ID[key] !== undefined,
      );
      expect(`${locale}: ${leftovers.join(", ")}`).toBe(`${locale}: `);
    }
  });

  test("keep interpolation placeholders identical across locales", () => {
    const placeholders = (value: string): string[] =>
      [...value.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]!).sort();

    for (const key of Object.keys(ID)) {
      const expected = placeholders(ID[key] ?? "");
      expect(`${key}:${placeholders(EN[key] ?? "").join(",")}`).toBe(
        `${key}:${expected.join(",")}`,
      );
      expect(`${key}:${placeholders(AR[key] ?? "").join(",")}`).toBe(
        `${key}:${expected.join(",")}`,
      );
    }
  });

  test("expose the same shape through the Dict type", () => {
    const dict: Dict = en;
    expect(dict.parent.title.length).toBeGreaterThan(0);
  });
});
