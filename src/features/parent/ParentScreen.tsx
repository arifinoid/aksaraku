import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "../../app/SessionContext";
import { useRewards } from "../../app/RewardsContext";
import {
  BREAK_REMINDER_OPTIONS,
  SESSION_LIMIT_OPTIONS,
  formatRemaining,
  remainingSince,
  type AppSettings,
  type Locale,
  type Profile,
} from "../../domain";
import { LOCALE_OPTIONS } from "../../i18n";
import { Button, Screen, Switch } from "../../ui";
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
  readonly onClose: () => void;
  readonly onPreview: () => void;
}

const TICK_MS = 10_000;

function SessionRemaining() {
  const { t } = useTranslation();
  const { startedAt, limitMin } = useSession();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="panel__hint">
      {t("parent.sessionRemaining", {
        time: formatRemaining(remainingSince(startedAt, limitMin, now)),
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
      <Screen title={t("parent.gateTitle")} center>
        <ParentGate onUnlock={() => setUnlocked(true)} onCancel={onClose} />
      </Screen>
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
        onBack={() => onViewChange("menu")}
      />
    );
  }

  return (
    <Screen title={t("parent.title")} onBack={onClose}>
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
          icon="📊"
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
        icon="👧"
        onClick={() => onViewChange("children")}
      />

      <Button
        label={t("parent.preview")}
        variant="secondary"
        icon="🔍"
        onClick={onPreview}
      />

      <Button
        label={t("parent.switchProfile")}
        variant="ghost"
        onClick={() => onViewChange("children")}
      />
    </Screen>
  );
}
