import * as E from "fp-ts/Either";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { avatarEmoji, DEFAULT_AVATAR_ID } from "../../data/avatars";
import {
  createProfile,
  type Locale,
  type Profile,
  type ProfileId,
  profileErrorMessageKey,
} from "../../domain";
import { LOCALE_OPTIONS, useActiveLocale } from "../../i18n";
import { newId } from "../../platform/ids";
import { Button, Screen } from "../../ui";
import "./profiles.css";

export interface ProfileScreenProps {
  readonly profiles: readonly Profile[];
  readonly onSelect: (profile: Profile) => void;
  readonly onCreate: (profile: Profile) => void;
}

export function ProfileScreen({
  profiles,
  onSelect,
  onCreate,
}: ProfileScreenProps) {
  const { t } = useTranslation();
  const activeLocale = useActiveLocale();
  const [name, setName] = useState("");
  const [locale, setLocale] = useState<Locale>(activeLocale);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const submit = () => {
    const result = createProfile({
      id: newId() as ProfileId,
      name,
      avatarId: DEFAULT_AVATAR_ID,
      locale,
      createdAt: Date.now(),
    });

    if (E.isLeft(result)) {
      setErrorKey(profileErrorMessageKey(result.left));
      return;
    }

    setErrorKey(null);
    setName("");
    onCreate(result.right);
  };

  return (
    <Screen title={t("profiles.title")}>
      <p className="profiles__subtitle">{t("profiles.subtitle")}</p>

      {profiles.length > 0 ? (
        <ul className="profiles__list">
          {profiles.map((profile) => (
            <li key={profile.id}>
              <button
                type="button"
                className="profile-card"
                onClick={() => onSelect(profile)}
              >
                <span className="profile-card__avatar" aria-hidden="true">
                  {avatarEmoji(profile.avatarId)}
                </span>
                <span className="profile-card__name">{profile.name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="panel__hint">{t("profiles.empty")}</p>
      )}

      <form
        className="profiles__form panel"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <h2 className="panel__title">{t("profiles.add")}</h2>
        <label className="field">
          <span className="field__label">{t("profiles.namePlaceholder")}</span>
          <input
            className="field__input"
            value={name}
            maxLength={20}
            placeholder={t("profiles.namePlaceholder")}
            onChange={(event) => setName(event.currentTarget.value)}
          />
        </label>
        <label className="field">
          <span className="field__label">{t("profiles.language")}</span>
          <select
            className="field__select"
            value={locale}
            onChange={(event) =>
              setLocale(event.currentTarget.value as Locale)
            }
          >
            {LOCALE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {errorKey ? (
          <p className="profiles__error" role="alert">
            {t(errorKey)}
          </p>
        ) : null}
        <Button label={t("profiles.start")} type="submit" block />
      </form>
    </Screen>
  );
}
