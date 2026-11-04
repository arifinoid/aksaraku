import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Check, CloudOff, Languages, ShieldCheck } from "lucide-react";
import { changeLocale, LOCALE_OPTIONS, useActiveLocale } from "../../i18n";
import type { Locale } from "../../domain/types";
import {
  detectPlatform,
  resolveInstallClick,
  type InstallAction,
} from "./install";
import { pickInitialLocale } from "./locale";
import { FoxMascot } from "./FoxMascot";
import "./landing.css";

const STORAGE_KEY = "aksaraku:locale";

/** Chip copy per locale, so each chip reads in the language it selects. */
const CHIP_LABEL = {
  id: "landing.languages.id",
  en: "landing.languages.en",
  ar: "landing.languages.ar",
} as const satisfies Record<Locale, string>;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const useInstall = () => {
  const [action, setAction] = useState<InstallAction>({
    action: "instructions",
    platform: "desktop",
  });
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const platform = detectPlatform(navigator.userAgent);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;

    setAction({ action: "instructions", platform });

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e as BeforeInstallPromptEvent;
      if (!isStandalone) {
        setAction({ action: "prompt" });
      }
    };

    window.addEventListener(
      "beforeinstallprompt",
      onBeforeInstallPrompt as EventListener,
    );

    if (isStandalone) {
      setAction({ action: "open" });
    }

    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        onBeforeInstallPrompt as EventListener,
      );
  }, []);

  const triggerInstall = useCallback(async () => {
    const deferred = deferredRef.current;
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      setAction({ action: "open" });
    }
    deferredRef.current = null;
  }, []);

  return { action, triggerInstall, hasDeferredPrompt: deferredRef };
};

/**
 * Public landing page, laid out as the pen.dev "01 · Onboarding & Bahasa"
 * screen: brand row, mascot, one headline, the three promises, the language
 * picker and a single primary action.
 */
export function LandingPage() {
  const { t } = useTranslation();
  const activeLocale = useActiveLocale();
  const [showInstructions, setShowInstructions] = useState(false);
  const { action, triggerInstall, hasDeferredPrompt } = useInstall();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const locale = pickInitialLocale(saved, navigator.language);
    void changeLocale(locale);
  }, []);

  const handleLocaleChange = useCallback((locale: Locale) => {
    localStorage.setItem(STORAGE_KEY, locale);
    void changeLocale(locale);
  }, []);

  const handleInstallClick = useCallback(() => {
    const outcome = resolveInstallClick({
      action,
      hasDeferredPrompt: hasDeferredPrompt.current !== null,
    });
    if (outcome.kind === "go-to-app") {
      window.location.assign("/app");
    } else if (outcome.kind === "trigger-prompt") {
      void triggerInstall();
    } else {
      setShowInstructions(true);
    }
  }, [action, triggerInstall, hasDeferredPrompt]);

  const ctaLabel = useMemo(
    () =>
      action.action === "open"
        ? t("landing.install.openApp")
        : t("landing.onboarding.cta"),
    [action, t],
  );

  const instructionsKey = useMemo(() => {
    const platform =
      action.action === "instructions"
        ? action.platform
        : detectPlatform(navigator.userAgent);
    return platform === "ios"
      ? "landing.install.ios"
      : platform === "android"
      ? "landing.install.android"
      : "landing.install.desktop";
  }, [action]);

  return (
    <div className="landing">
      <a href="#main" className="landing__skip">
        {t("landing.nav.skip")}
      </a>

      <main id="main" className="landing__screen">
        <header className="landing__brand-row">
          <a href="/" className="landing__brand">
            <span className="landing__logo-tile" aria-hidden="true">
              A
            </span>
            <span className="landing__wordmark">{t("app.name")}</span>
          </a>
          <span className="landing__age-pill">{t("landing.onboarding.age")}</span>
        </header>

        <div className="landing__mascot">
          <span className="landing__blob" aria-hidden="true" />
          <span
            className="landing__dot landing__dot--mango"
            aria-hidden="true"
          />
          <span className="landing__dot landing__dot--mint" aria-hidden="true" />
          <span className="landing__dot landing__dot--pink" aria-hidden="true" />
          <span
            className="landing__dot landing__dot--grape"
            aria-hidden="true"
          />
          <FoxMascot className="landing__fox" />
          <span className="landing__bubble">
            {t("landing.hero.mascotGreeting")}
          </span>
        </div>

        <h1 className="landing__headline">{t("landing.hero.tagline")}</h1>
        <p className="landing__subhead">{t("landing.hero.subtitle")}</p>

        <ul className="landing__features">
          <li className="landing__feature">
            <span className="landing__feature-icon landing__feature-icon--mint">
              <CloudOff size={20} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="landing__feature-label">
              {t("landing.onboarding.offline")}
            </span>
          </li>
          <li className="landing__feature">
            <span className="landing__feature-icon landing__feature-icon--grape">
              <Languages size={20} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="landing__feature-label">
              {t("landing.onboarding.languages")}
            </span>
          </li>
          <li className="landing__feature">
            <span className="landing__feature-icon landing__feature-icon--mango">
              <ShieldCheck size={20} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="landing__feature-label">
              {t("landing.onboarding.safe")}
            </span>
          </li>
        </ul>

        <section className="landing__language">
          <h2 id="landing-language-label" className="landing__label">
            {t("landing.onboarding.languageLabel")}
          </h2>
          <div
            className="landing__chips"
            role="group"
            aria-labelledby="landing-language-label"
          >
            {LOCALE_OPTIONS.map((option) => {
              const isActive = activeLocale === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`landing__chip${
                    isActive ? " is-active" : ""
                  }${option.value === "ar" ? " landing__chip--arabic" : ""}`}
                  onClick={() => handleLocaleChange(option.value)}
                  aria-pressed={isActive}
                  lang={option.value}
                >
                  <span>{t(CHIP_LABEL[option.value])}</span>
                  {isActive ? (
                    <Check size={14} strokeWidth={3} aria-hidden="true" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        <button
          type="button"
          className="landing__cta"
          onClick={handleInstallClick}
        >
          <span>{ctaLabel}</span>
          <ArrowRight
            className="landing__cta-icon"
            size={19}
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </button>

        <p className="landing__parent-link">
          {t("landing.onboarding.parentLink")}
        </p>
      </main>

      {showInstructions ? (
        <div
          className="landing__modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowInstructions(false);
          }}
        >
          <div className="landing__modal">
            <h2 id="install-modal-title">{t("landing.install.instructions")}</h2>
            <p>{t(instructionsKey)}</p>
            <button
              type="button"
              className="landing__modal-close"
              onClick={() => setShowInstructions(false)}
            >
              {t("common.back")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
