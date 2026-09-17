import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LOCALE_OPTIONS } from "../../i18n";
import type { AppSettings, Locale } from "../../domain";
import { Button, Screen, Switch } from "../../ui";
import { ParentGate } from "./ParentGate";
import "./parent.css";

export interface ParentScreenProps {
  readonly settings: AppSettings;
  readonly onChangeLocale: (locale: Locale) => void;
  readonly onToggleHaptics: (enabled: boolean) => void;
  readonly onToggleAudio: (enabled: boolean) => void;
  readonly onClose: () => void;
  readonly onSwitchProfile: () => void;
  readonly onPreview: () => void;
}

export function ParentScreen({
  settings,
  onChangeLocale,
  onToggleHaptics,
  onToggleAudio,
  onClose,
  onSwitchProfile,
  onPreview,
}: ParentScreenProps) {
  const { t } = useTranslation();
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return (
      <Screen title={t("parent.gateTitle")} center>
        <ParentGate onUnlock={() => setUnlocked(true)} onCancel={onClose} />
      </Screen>
    );
  }

  return (
    <Screen title={t("parent.title")} onBack={onClose}>
      <section className="panel">
        <h2 className="panel__title">{t("parent.progress")}</h2>
        <p className="panel__hint">{t("parent.progressSoon")}</p>
      </section>

      <section className="panel">
        <h2 className="panel__title">{t("parent.screenTime")}</h2>
        <p className="panel__hint">{t("common.soon")}</p>
      </section>

      <section className="panel">
        <h2 className="panel__title">{t("parent.settings")}</h2>
        <label className="field">
          <span className="field__label">{t("parent.language")}</span>
          <select
            className="field__select"
            value={settings.locale}
            onChange={(event) => onChangeLocale(event.currentTarget.value as Locale)}
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
      </section>

      <Button
        label={t("parent.preview")}
        variant="secondary"
        icon="🔍"
        onClick={onPreview}
      />

      <Button
        label={t("parent.switchProfile")}
        variant="secondary"
        onClick={onSwitchProfile}
      />
    </Screen>
  );
}
