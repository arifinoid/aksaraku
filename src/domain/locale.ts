import type { Locale } from "./types";

/** All supported locales, in display order. */
export const LOCALES: readonly Locale[] = ["id", "en", "ar"];

/** Type guard: narrows a string to a supported Locale. */
export const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);
