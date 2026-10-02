import type { Locale } from "../../domain/types";

const SUPPORTED: readonly Locale[] = ["id", "en", "ar"];

const fromNavigator = (navigatorLanguage: string | null): Locale | null => {
  if (!navigatorLanguage) return null;
  const prefix = navigatorLanguage.toLowerCase().split(/[-_]/)[0] ?? "";
  return (SUPPORTED as readonly string[]).includes(prefix)
    ? (prefix as Locale)
    : null;
};

/**
 * Pick the landing page's initial locale.
 *
 * Priority:
 * 1. A previously saved locale (from localStorage)
 * 2. The browser's navigator.language
 * 3. Fallback to "id" (the app's primary locale)
 */
export const pickInitialLocale = (
  saved: string | null,
  navigatorLanguage: string | null,
): Locale => {
  if (saved && (SUPPORTED as readonly string[]).includes(saved)) {
    return saved as Locale;
  }
  return fromNavigator(navigatorLanguage) ?? "id";
};
