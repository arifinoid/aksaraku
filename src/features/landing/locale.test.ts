import { describe, expect, test } from "bun:test";
import { pickInitialLocale } from "./locale";

describe("pickInitialLocale", () => {
  test("returns saved locale when valid", () => {
    expect(
      pickInitialLocale("en", "id-ID"),
    ).toBe("en");
  });

  test("returns saved locale when ar", () => {
    expect(
      pickInitialLocale("ar", "en-US"),
    ).toBe("ar");
  });

  test("falls back to navigator language when saved is invalid", () => {
    expect(
      pickInitialLocale("", "en-US"),
    ).toBe("en");
  });

  test("falls back to navigator language when saved is null", () => {
    expect(
      pickInitialLocale(null, "en-US"),
    ).toBe("en");
  });

  test("handles navigator.language with id prefix", () => {
    expect(
      pickInitialLocale(null, "id-ID"),
    ).toBe("id");
  });

  test("handles navigator.language with ar prefix", () => {
    expect(
      pickInitialLocale(null, "ar-SA"),
    ).toBe("ar");
  });

  test("defaults to id when navigator is unknown", () => {
    expect(
      pickInitialLocale(null, "fr-FR"),
    ).toBe("id");
  });

  test("defaults to id when navigator is empty", () => {
    expect(
      pickInitialLocale(null, ""),
    ).toBe("id");
  });

  test("defaults to id when everything is null", () => {
    expect(
      pickInitialLocale(null, null),
    ).toBe("id");
  });
});
