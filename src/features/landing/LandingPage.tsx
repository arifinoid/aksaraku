import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { changeLocale, LOCALE_OPTIONS, useActiveLocale } from "../../i18n";
import { isLocale } from "../../domain/locale";
import { LOCALE_FLAG } from "../../i18n";
import type { Locale } from "../../domain/types";
import {
  classifyInstall,
  detectPlatform,
  resolveInstallClick,
  type InstallAction,
} from "./install";
import { pickInitialLocale } from "./locale";
import "./landing.css";

const STORAGE_KEY = "aksaraku:locale";

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

export function LandingPage() {
  const { t } = useTranslation();
  const [showInstructions, setShowInstructions] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { action, triggerInstall, hasDeferredPrompt } = useInstall();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const locale = pickInitialLocale(saved, navigator.language);
    void changeLocale(locale);
  }, []);

  const handleLocaleChange = useCallback((locale: Locale) => {
    localStorage.setItem(STORAGE_KEY, locale);
    void changeLocale(locale);
    setShowLangMenu(false);
  }, []);

  const handleLangTriggerClick = useCallback(() => {
    setShowLangMenu((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const scrollToHow = useCallback(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document
      .getElementById("how-it-works")
      ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, []);

  const installLabel = useMemo(() => {
    if (action.action === "open") return t("landing.install.openApp");
    if (action.action === "instructions") return t("landing.nav.install");
    return t("landing.hero.ctaInstall");
  }, [action, t]);

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

  const currentLocale = useActiveLocale();

  return (
    <div className="landing">
      <a href="#main" className="landing__skip">
        {t("landing.nav.skip")}
      </a>

      <header>
        <nav className="landing__nav" aria-label="primary">
          <a href="/" className="landing__brand">
            <img src="/icon.svg" alt="" width="44" height="44" />
            <span>{t("app.name")}</span>
          </a>
          <div className="landing__nav-actions">
            <div
              className="landing__lang-wrapper"
              role="combobox"
              aria-expanded={showLangMenu}
              aria-haspopup="listbox"
              aria-label={t("parent.language")}
            >
              <button
                ref={triggerRef}
                type="button"
                className="landing__lang-trigger"
                onClick={handleLangTriggerClick}
                aria-label={t("parent.language")}
                aria-expanded={showLangMenu}
                aria-haspopup="listbox"
              >
                <span className="landing__lang-flag" aria-hidden="true">
                  {LOCALE_FLAG[useActiveLocale()]}
                </span>
                <span className="landing__lang-chevron" aria-hidden="true">
                  ▼
                </span>
              </button>
              {showLangMenu && (
                <div
                  ref={langMenuRef}
                  className="landing__lang-menu"
                  role="listbox"
                  aria-label={t("parent.language")}
                >
                  {LOCALE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      role="option"
                      className={`landing__lang-option ${useActiveLocale() === opt.value ? "is-active" : ""}`}
                      onClick={() => handleLocaleChange(opt.value)}
                      aria-selected={useActiveLocale() === opt.value}
                    >
                      <span className="landing__lang-option-flag" aria-hidden="true">
                        {LOCALE_FLAG[opt.value]}
                      </span>
                      <span className="landing__lang-option-label">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              className="landing__install-btn"
              onClick={handleInstallClick}
            >
              {installLabel}
            </button>
          </div>
        </nav>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="landing__hero" aria-labelledby="hero-heading">
          <h1 id="hero-heading">{t("landing.hero.tagline")}</h1>
          <p>{t("landing.hero.subtitle")}</p>
          <div className="landing__hero-actions">
            <button
              type="button"
              className="landing__install-btn"
              onClick={handleInstallClick}
            >
              {t("landing.hero.ctaInstall")}
            </button>
            <button
              type="button"
              className="landing__install-btn landing__install-btn--ghost"
              onClick={scrollToHow}
            >
              {t("landing.hero.ctaHow")}
            </button>
          </div>
          <div className="landing__hero-visual" aria-hidden="true">
            <img
              src="/icon.svg"
              alt=""
              width="200"
              height="200"
              style={{ width: "100%", maxWidth: "200px", borderRadius: "28px" }}
            />
          </div>
        </section>

        {/* Features */}
        <section className="landing__features" aria-labelledby="features-heading">
          <h2 id="features-heading" className="landing__section-title">
            {t("landing.features.title")}
          </h2>
          <div className="landing__feature-grid">
            <article className="landing__feature-card">
              <span className="icon" aria-hidden="true">✍️</span>
              <h3>{t("landing.features.writing.title")}</h3>
              <p>{t("landing.features.writing.desc")}</p>
            </article>
            <article className="landing__feature-card">
              <span className="icon" aria-hidden="true">🎮</span>
              <h3>{t("landing.features.games.title")}</h3>
              <p>{t("landing.features.games.desc")}</p>
            </article>
            <article className="landing__feature-card">
              <span className="icon" aria-hidden="true">⭐</span>
              <h3>{t("landing.features.rewards.title")}</h3>
              <p>{t("landing.features.rewards.desc")}</p>
            </article>
            <article className="landing__feature-card">
              <span className="icon" aria-hidden="true">👤</span>
              <h3>{t("landing.features.parent.title")}</h3>
              <p>{t("landing.features.parent.desc")}</p>
            </article>
          </div>
        </section>

        {/* How it works */}
        <section
          className="landing__how"
          aria-labelledby="how-heading"
          id="how-it-works"
        >
          <h2 id="how-heading" className="landing__section-title">
            {t("landing.how.title")}
          </h2>
          <div className="landing__steps">
            <div className="landing__step">
              <span className="number">1</span>
              <h3>{t("landing.how.step1.title")}</h3>
              <p>{t("landing.how.step1.desc")}</p>
            </div>
            <div className="landing__step">
              <span className="number">2</span>
              <h3>{t("landing.how.step2.title")}</h3>
              <p>{t("landing.how.step2.desc")}</p>
            </div>
            <div className="landing__step">
              <span className="number">3</span>
              <h3>{t("landing.how.step3.title")}</h3>
              <p>{t("landing.how.step3.desc")}</p>
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="landing__trust" aria-labelledby="trust-heading">
          <h2 id="trust-heading" className="landing__section-title">
            {t("landing.trust.title")}
          </h2>
          <div className="landing__badges">
            <div className="landing__badge">
              <span className="icon" aria-hidden="true">📴</span>
              <span>{t("landing.trust.offline")}</span>
            </div>
            <div className="landing__badge">
              <span className="icon" aria-hidden="true">🚫</span>
              <span>{t("landing.trust.noAds")}</span>
            </div>
            <div className="landing__badge">
              <span className="icon" aria-hidden="true">🔒</span>
              <span>{t("landing.trust.private")}</span>
            </div>
            <div className="landing__badge">
              <span className="icon" aria-hidden="true">👨‍👩‍👧</span>
              <span>{t("landing.trust.multiChild")}</span>
            </div>
          </div>
        </section>

        {/* Languages */}
        <section
          className="landing__languages"
          aria-labelledby="languages-heading"
        >
          <h2 id="languages-heading" className="landing__section-title">
            {t("landing.languages.title")}
          </h2>
          <div className="landing__lang-pills">
            <span className="landing__lang-pill">🇮🇩 {t("landing.languages.id")}</span>
            <span className="landing__lang-pill">🇬🇧 {t("landing.languages.en")}</span>
            <span className="landing__lang-pill">🇸🇦 {t("landing.languages.ar")}</span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing__footer">
        <div className="landing__footer-cta">
          <button
            type="button"
            className="landing__install-btn"
            onClick={handleInstallClick}
          >
            {t("landing.footer.cta")}
          </button>
        </div>
        <p>{t("landing.footer.madeBy")}</p>
      </footer>

      {/* Install instructions modal */}
      {showInstructions && instructionsKey ? (
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