import * as E from "fp-ts/Either";
import { Check, ChevronDown, CircleAlert, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AVATAR_OPTIONS,
  avatarEmoji,
  DEFAULT_AVATAR_ID,
} from "../../data/avatars";
import {
  createProfile,
  type AvatarId,
  type Locale,
  type Profile,
  type ProfileId,
  profileErrorMessageKey,
} from "../../domain";
import { LOCALE_OPTIONS, useActiveLocale } from "../../i18n";
import { newId } from "../../platform/ids";
import { Icon } from "../../ui";
import "./profiles.css";

export interface ProfileScreenProps {
  readonly profiles: readonly Profile[];
  readonly onSelect: (profile: Profile) => void;
  readonly onCreate: (profile: Profile) => void;
}

/**
 * First-run screen, drawn from the pen.dev "21 · Tambah Anak" and
 * "22 · Ganti Anak" sheets: one title, one subtitle, a row per child and a
 * single "Tambah Anak" row. The add form replaces the list in place instead
 * of opening an overlay, so the phone flow stays one screen deep.
 */
export function ProfileScreen({
  profiles,
  onSelect,
  onCreate,
}: ProfileScreenProps) {
  const { t } = useTranslation();
  const activeLocale = useActiveLocale();
  const [adding, setAdding] = useState(profiles.length === 0);
  const [name, setName] = useState("");
  const [avatarId, setAvatarId] = useState<AvatarId>(DEFAULT_AVATAR_ID);
  const [locale, setLocale] = useState<Locale>(activeLocale);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const submit = () => {
    const result = createProfile({
      id: newId() as ProfileId,
      name,
      avatarId,
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
    <div className="profiles">
      <div className="profiles__sheet">
        <span className="profiles__handle" aria-hidden="true" />

        <h1 className="profiles__title">
          {adding ? t("profiles.add") : t("profiles.title")}
        </h1>
        <p className="profiles__sub">
          {adding ? t("profiles.addSub") : t("profiles.subtitle")}
        </p>

        {adding ? (
          <form
            className="profiles__form"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <div
              className="profiles__field"
              role="group"
              aria-labelledby="profiles-avatar-label"
            >
              <span className="profiles__label" id="profiles-avatar-label">
                {t("profiles.avatar")}
              </span>
              <div className="profiles__avatars">
                {AVATAR_OPTIONS.map((option) => {
                  const selected = option.id === avatarId;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className="profiles__avatar-option"
                      aria-pressed={selected}
                      aria-label={option.id}
                      onClick={() => setAvatarId(option.id)}
                    >
                      <span aria-hidden="true">{option.emoji}</span>
                      {selected ? (
                        <span className="profiles__check" aria-hidden="true">
                          <Icon glyph={Check} size={9} />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="profiles__field">
              <span className="profiles__label">
                {t("profiles.namePlaceholder")}
              </span>
              <input
                className="profiles__input"
                value={name}
                maxLength={20}
                autoComplete="off"
                placeholder={t("profiles.namePlaceholder")}
                onChange={(event) => setName(event.currentTarget.value)}
              />
            </label>

            <label className="profiles__field">
              <span className="profiles__label">{t("profiles.language")}</span>
              <span className="profiles__select">
                <select
                  className="profiles__select-input"
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
                <Icon
                  glyph={ChevronDown}
                  size={16}
                  className="profiles__chevron"
                />
              </span>
            </label>

            {errorKey ? (
              <p className="profiles__error" role="alert">
                <Icon glyph={CircleAlert} size={14} />
                {t(errorKey)}
              </p>
            ) : null}

            <div className="profiles__actions">
              {profiles.length > 0 ? (
                <button
                  type="button"
                  className="profiles__cancel"
                  onClick={() => setAdding(false)}
                >
                  {t("profiles.cancel")}
                </button>
              ) : null}
              <button type="submit" className="profiles__save">
                <span>{t("profiles.save")}</span>
                <Icon glyph={Check} size={17} />
              </button>
            </div>
          </form>
        ) : (
          <>
            <ul className="profiles__list">
              {profiles.map((profile) => (
                <li key={profile.id}>
                  <button
                    type="button"
                    className="profiles__child"
                    onClick={() => onSelect(profile)}
                  >
                    <span className="profiles__avatar" aria-hidden="true">
                      {avatarEmoji(profile.avatarId)}
                    </span>
                    <span className="profiles__child-copy">
                      <span className="profiles__child-name">{profile.name}</span>
                      <span className="profiles__child-meta">
                        {LOCALE_OPTIONS.find(
                          (option) => option.value === profile.locale,
                        )?.label ?? profile.locale}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="profiles__add"
              onClick={() => setAdding(true)}
            >
              <span className="profiles__add-icon" aria-hidden="true">
                <Icon glyph={Plus} size={18} />
              </span>
              <span className="profiles__add-label">{t("profiles.add")}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
