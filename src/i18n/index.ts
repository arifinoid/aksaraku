import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { Locale } from "../domain";
import { ar } from "./locales/ar";
import { en } from "./locales/en";
import { id } from "./locales/id";

export const resources = {
  id: { common: id },
  en: { common: en },
  ar: { common: ar },
};

export const RTL_LOCALES: readonly Locale[] = ["ar"];

export const isRtl = (locale: string): boolean =>
  (RTL_LOCALES as readonly string[]).includes(locale);

export const LOCALE_OPTIONS: readonly {
  readonly value: Locale;
  readonly label: string;
}[] = [
  { value: "id", label: "Bahasa Indonesia" },
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
];

export const applyDirection = (locale: string): void => {
  document.documentElement.lang = locale;
  document.documentElement.dir = isRtl(locale) ? "rtl" : "ltr";
};

export const initI18n = (locale: Locale): typeof i18n => {
  if (!i18n.isInitialized) {
    void i18n.use(initReactI18next).init({
      resources,
      lng: locale,
      fallbackLng: "id",
      defaultNS: "common",
      interpolation: { escapeValue: false },
    });
  }
  applyDirection(locale);
  return i18n;
};

export const changeLocale = async (locale: Locale): Promise<void> => {
  await i18n.changeLanguage(locale);
  applyDirection(locale);
};

export default i18n;
