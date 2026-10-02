import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { isLocale } from "./domain/locale";
import type { Locale } from "./domain/types";
import {
  changeLocale,
  initI18n,
  isRtl,
} from "./i18n";
import { setupPwa } from "./platform/pwa";
import { LandingPage } from "./features/landing/LandingPage";
import { pickInitialLocale } from "./features/landing/locale";
import "./index.css";

const STORAGE_KEY = "aksaraku:locale";

const setupLanding = (): void => {
  const saved = localStorage.getItem(STORAGE_KEY);
  const locale = pickInitialLocale(saved, navigator.language);
  initI18n(locale);
  // Save so the app (and next visit) remembers the choice.
  localStorage.setItem(STORAGE_KEY, locale);
};

const applyRtlFlag = (): void => {
  document.documentElement.dir = isRtl(document.documentElement.lang) ? "rtl" : "ltr";
};

setupLanding();
applyRtlFlag();
setupPwa();

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <LandingPage />
  </StrictMode>
);

(import.meta.hot.data.root ??= createRoot(elem)).render(app);
