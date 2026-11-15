import {
  ArrowLeft,
  ChevronRight,
  Eye,
  Ghost,
  Lock,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "../../app/SessionContext";
import { useRewards } from "../../app/RewardsContext";
import {
  BREAK_REMINDER_OPTIONS,
  SESSION_LIMIT_OPTIONS,
  formatRemaining,
  remainingMs,
  type AppSettings,
  type Locale,
  type Profile,
} from "../../domain";
import { avatarEmoji } from "../../data/avatars";
import { LOCALE_OPTIONS } from "../../i18n";
import { Icon, Switch } from "../../ui";
import { ParentChildren } from "./ParentChildren";
import { ParentGate } from "./ParentGate";
import { ParentReport } from "./ParentReport";
import "./parent.css";

export type ParentView = "menu" | "report" | "children";

export interface ParentScreenProps {
  readonly profile: Profile;
  readonly profiles: readonly Profile[];
  readonly settings: AppSettings;
  readonly view: ParentView;
  readonly onViewChange: (view: ParentView) => void;
  readonly onChangeLocale: (locale: Locale) => void;
  readonly onToggleHaptics: (enabled: boolean) => void;
  readonly onToggleAudio: (enabled: boolean) => void;
  readonly onToggleReduceMotion: (enabled: boolean) => void;
  readonly onSelectProfile: (profile: Profile) => void;
  readonly onDeleteProfile: (profile: Profile) => void;
  readonly onChangeProfileLocale: (profile: Profile, locale: Locale) => void;
  readonly onAddProfile: () => void;
  readonly onClose: () => void;
  readonly onPreview: () => void;
}

const TICK_MS = 10_000;

function SessionRemaining() {
  const { t } = useTranslation();
  const { session, limitMin } = useSession();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  if (!session) return null;

  return (
    <p className="parent-card__note">
      {t("parent.sessionRemaining", {
        time: formatRemaining(remainingMs(session, limitMin, now)),
      })}
    </p>
  );
}

export function ParentScreen({
  profile,
  profiles,
  settings,
  view,
  onViewChange,
  onChangeLocale,
  onToggleHaptics,
  onToggleAudio,
  onToggleReduceMotion,
  onSelectProfile,
  onDeleteProfile,
  onChangeProfileLocale,
  onAddProfile,
  onClose,
  onPreview,
}: ParentScreenProps) {
  const { t } = useTranslation();
  const [unlocked, setUnlocked] = useState(false);
  const { stats, mastery } = useRewards();
  const { limitMin, breakReminderMin, setLimitMin, setBreakReminderMin } =
    useSession();

  if (!unlocked) {
    return <ParentGate onUnlock={() => setUnlocked(true)} onCancel={onClose} />;
  }

  if (view === "report") {
    return (
      <ParentReport profile={profile} onBack={() => onViewChange("menu")} />
    );
  }

  if (view === "children") {
    return (
      <ParentChildren
        profiles={profiles}
        current={profile}
        onSelect={onSelectProfile}
        onDelete={onDeleteProfile}
        onChangeLocale={onChangeProfileLocale}
        onAdd={onAddProfile}
        onBack={() => onViewChange("menu")}
      />
    );
  }

  // The most recent practice moment, for the "last activity" desktop card.
  const lastSeen = mastery.reduce(
    (latest, entry) =>
      entry.lastSeenAt != null && (latest === 0 || entry.lastSeenAt > latest)
        ? entry.lastSeenAt
        : latest,
    0,
  );
  const hasActivity = lastSeen > 0;
  const lastActivityLabel = hasActivity
    ? new Date(lastSeen).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <div className="parent">
      <header className="parent__top">
        <button type="button" className="back-pill" onClick={onClose}>
          <Icon glyph={ArrowLeft} size={16} />
          <span>{t("common.back")}</span>
        </button>
        <h1 className="parent__title">{t("parent.title")}</h1>
        <div className="parent__meta">
          <span className="parent__pin">
            <Icon glyph={Lock} size={14} className="parent__pin-icon" />
            {t("parent.pinActive")}
          </span>
          <span className="parent__face" aria-hidden="true">
            {avatarEmoji(profile.avatarId)}
          </span>
        </div>
      </header>

      <div className="parent__layout">
        <div className="parent__col">
          <section className="parent-card">
            <div className="parent-head">
              <span className="parent-head__avatar" aria-hidden="true">
                {avatarEmoji(profile.avatarId)}
              </span>
              <div className="parent-head__copy">
                <h2 className="parent-head__title">
                  {t("parent.progressFor", { name: profile.name })}
                </h2>
              </div>
              <span className="parent-head__caption">{t("parent.weekLabel")}</span>
            </div>

            <div className="parent-stats">
              <div className="parent-stats__item">
                <span className="parent-stats__value parent-stats__value--coral">
                  {stats.itemsMastered}
                </span>
                <span className="parent-stats__label">
                  {t("parent.statMastered")}
                </span>
              </div>
              <div className="parent-stats__item">
                <span className="parent-stats__value parent-stats__value--sky">
                  {stats.itemsAttempted}
                </span>
                <span className="parent-stats__label">
                  {t("parent.statAttempted")}
                </span>
              </div>
              <div className="parent-stats__item">
                <span className="parent-stats__value parent-stats__value--mango">
                  {stats.starsEarned}
                </span>
                <span className="parent-stats__label">
                  {t("parent.statStars")}
                </span>
              </div>
              <div className="parent-stats__item parent-stats__item--extra">
                <span className="parent-stats__value parent-stats__value--grape">
                  {stats.totalAttempts}
                </span>
                <span className="parent-stats__label">
                  {t("parent.statAttempts")}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="parent-report-btn"
              onClick={() => onViewChange("report")}
            >
              <Icon glyph={TrendingUp} size={16} />
              <span>{t("parent.report")}</span>
              <Icon glyph={ChevronRight} size={16} className="parent-report-btn__chev" />
            </button>
          </section>

          <section className="parent-card">
            <h2 className="parent-card__heading">{t("parent.screenTime")}</h2>
            <div className="parent-time__row">
              <label className="field">
                <span className="field__label">{t("parent.sessionLimit")}</span>
                <select
                  className="field__select"
                  value={limitMin}
                  onChange={(event) =>
                    setLimitMin(Number.parseInt(event.currentTarget.value, 10))
                  }
                >
                  {SESSION_LIMIT_OPTIONS.map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {t("parent.minutes", { minutes })}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="field__label">{t("parent.breakReminder")}</span>
                <select
                  className="field__select"
                  value={breakReminderMin}
                  onChange={(event) =>
                    setBreakReminderMin(
                      Number.parseInt(event.currentTarget.value, 10),
                    )
                  }
                >
                  {BREAK_REMINDER_OPTIONS.map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes === 0
                        ? t("parent.breakOff")
                        : t("parent.minutes", { minutes })}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <SessionRemaining />
          </section>

          <section className="parent-card parent-card--activity">
            <div className="parent-activity__headrow">
              <h2 className="parent-card__heading">{t("parent.lastActivity")}</h2>
              <span className="parent-head__caption">
                {lastActivityLabel ?? t("parent.noneYet")}
              </span>
            </div>
            <div className="parent-activity">
              <span className="parent-activity__icon" aria-hidden="true">
                <Icon glyph={hasActivity ? Sparkles : Ghost} size={18} />
              </span>
              <div className="parent-activity__copy">
                <span className="parent-activity__title">
                  {hasActivity
                    ? t("parent.lastPlayedTitle")
                    : t("parent.noActivityTitle")}
                </span>
                <span className="parent-activity__sub">
                  {hasActivity
                    ? t("parent.lastActivityDate", { date: lastActivityLabel })
                    : t("parent.startPractice", { name: profile.name })}
                </span>
              </div>
              <button
                type="button"
                className="parent-activity__link"
                onClick={onClose}
              >
                {t("parent.start")}
              </button>
            </div>
          </section>
        </div>

        <div className="parent__col">
          <section className="parent-card">
            <h2 className="parent-card__heading">{t("parent.settings")}</h2>
            <label className="field">
              <span className="field__label">{t("parent.language")}</span>
              <select
                className="field__select"
                value={settings.locale}
                onChange={(event) =>
                  onChangeLocale(event.currentTarget.value as Locale)
                }
              >
                {LOCALE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <Switch
              label={t("parent.haptics")}
              checked={settings.hapticsEnabled}
              onChange={onToggleHaptics}
            />
            <Switch
              label={t("parent.audio")}
              checked={settings.audioEnabled}
              onChange={onToggleAudio}
            />
            <Switch
              label={t("parent.reduceMotion")}
              checked={settings.reduceMotion}
              onChange={onToggleReduceMotion}
            />
          </section>

          <button
            type="button"
            className="parent-action"
            onClick={() => onViewChange("children")}
          >
            <Icon glyph={Users} size={16} />
            <span>{t("parent.manageChildren")}</span>
            <Icon glyph={ChevronRight} size={15} className="parent-action__chev" />
          </button>

          <button type="button" className="parent-action" onClick={onPreview}>
            <Icon glyph={Eye} size={16} />
            <span>{t("parent.preview")}</span>
            <Icon glyph={ChevronRight} size={15} className="parent-action__chev" />
          </button>

          <button
            type="button"
            className="parent__swap"
            onClick={() => onViewChange("children")}
          >
            <Icon glyph={Users} size={15} />
            <span>{t("parent.switchProfile")}</span>
          </button>

          <div className="parent-tips">
            <div className="parent-tips__head">
              <Icon glyph={Sparkles} size={15} />
              <span>{t("parent.tipsTitle")}</span>
            </div>
            <p className="parent-tips__body">{t("parent.tipsBody")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
