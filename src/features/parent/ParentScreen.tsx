import { ArrowLeft, BarChart3, Eye, Users } from "lucide-react";
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
import { LOCALE_OPTIONS } from "../../i18n";
import { Button, Icon, Screen, Switch } from "../../ui";
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
    <p className="panel__hint">
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
  onClose,
  onPreview,
}: ParentScreenProps) {
  const { t } = useTranslation();
  const [unlocked, setUnlocked] = useState(false);
  const { stats } = useRewards();
  const { limitMin, breakReminderMin, setLimitMin, setBreakReminderMin } =
    useSession();

  if (!unlocked) {
    return (
      <div className="parent-gate">
        <ParentGate onUnlock={() => setUnlocked(true)} onCancel={onClose} />
      </div>
    );
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
        onBack={() => onViewChange("menu")}
      />
    );
  }

  return (
    <div className="parent">
      <header className="parent__top">
        <button type="button" className="parent__back" onClick={onClose}>
          <Icon glyph={ArrowLeft} size={16} />
          <span>{t("common.back")}</span>
        </button>
        <div className="parent__titles">
          <h1 className="parent__title">{t("parent.title")}</h1>
          <p className="parent__sub">{t("parent.subtitle")}</p>
        </div>
        <div className="parent__meta" />
      </header>

      <section className="panel">
        <h2 className="panel__title">
          {t("parent.progressFor", { name: profile.name })}
        </h2>
        <p className="parent__stats">
          {t("parent.progressQuick", {
            mastered: stats.itemsMastered,
            attempted: stats.itemsAttempted,
            stars: stats.starsEarned,
          })}
        </p>
        <Button
          label={t("parent.report")}
          variant="secondary"
          icon={<Icon glyph={BarChart3} size={14} />}
          onClick={() => onViewChange("report")}
        />
      </section>

      <section className="panel">
        <h2 className="panel__title">{t("parent.screenTime")}</h2>
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
        <SessionRemaining />
      </section>

      <section className="panel">
        <h2 className="panel__title">{t("parent.settings")}</h2>
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

      <Button
        label={t("parent.manageChildren")}
        variant="secondary"
        icon={<Icon glyph={Users} size={14} />}
        onClick={() => onViewChange("children")}
      />

      <Button
        label={t("parent.preview")}
        variant="secondary"
        icon={<Icon glyph={Eye} size={14} />}
        onClick={onPreview}
      />

      <Button
        label={t("parent.switchProfile")}
        variant="ghost"
        icon={<Icon glyph={Users} size={14} />}
        onClick={() => onViewChange("children")}
      />
    </div>
  );
}
