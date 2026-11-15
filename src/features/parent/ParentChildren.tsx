import { ArrowLeft, CircleCheck, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { avatarEmoji } from "../../data/avatars";
import type { Locale, Profile } from "../../domain";
import { LOCALE_OPTIONS } from "../../i18n";
import { Icon } from "../../ui";
import "./parent.css";

export interface ParentChildrenProps {
  readonly profiles: readonly Profile[];
  readonly current: Profile;
  readonly onSelect: (profile: Profile) => void;
  readonly onDelete: (profile: Profile) => void;
  readonly onChangeLocale: (profile: Profile, locale: Locale) => void;
  readonly onAdd: () => void;
  readonly onBack: () => void;
}

/*
 * Rebuilt to pen.dev frame 16: one centered card per child (avatar, name,
 * language, delete), then the add-child card and the hint line.
 */
export function ParentChildren({
  profiles,
  current,
  onSelect,
  onDelete,
  onChangeLocale,
  onAdd,
  onBack,
}: ParentChildrenProps) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState<string | null>(null);
  const canDelete = profiles.length > 1;

  return (
    <div className="children">
      <header className="parent__top">
        <button type="button" className="back-pill" onClick={onBack}>
          <Icon glyph={ArrowLeft} size={16} />
          <span>{t("common.back")}</span>
        </button>
        <h1 className="parent__title">{t("parent.manageChildren")}</h1>
      </header>

      {profiles.map((profile) => {
        const active = profile.id === current.id;
        return (
          <section key={profile.id} className="parent-card child-card">
            <span className="child-card__avatar" aria-hidden="true">
              {avatarEmoji(profile.avatarId)}
            </span>

            <div className="child-card__namerow">
              <span className="child-card__name">{profile.name}</span>
              {active ? (
                <span className="child-card__badge">
                  <Icon glyph={CircleCheck} size={13} />
                  {t("parent.activeChild")}
                </span>
              ) : null}
            </div>

            <label className="child-card__locale field">
              <span className="visually-hidden">
                {t("parent.childLanguage", { name: profile.name })}
              </span>
              <select
                className="field__select"
                value={profile.locale}
                onChange={(event) =>
                  onChangeLocale(profile, event.currentTarget.value as Locale)
                }
              >
                {LOCALE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {confirming === profile.id ? (
              <div className="child-confirm">
                <button
                  type="button"
                  className="child-card__delete"
                  onClick={() => {
                    setConfirming(null);
                    if (canDelete) onDelete(profile);
                  }}
                >
                  {t("parent.deleteConfirm")}
                </button>
                <button
                  type="button"
                  className="child-card__delete child-card__delete--cancel"
                  onClick={() => setConfirming(null)}
                >
                  {t("parent.cancel")}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="child-card__delete"
                disabled={!canDelete}
                onClick={() => setConfirming(profile.id)}
              >
                <Icon glyph={Trash2} size={14} />
                <span>{t("parent.delete")}</span>
              </button>
            )}
          </section>
        );
      })}

      <section className="parent-card child-add">
        <button type="button" className="child-add__btn" onClick={onAdd}>
          <Icon glyph={Plus} size={16} className="child-add__icon" />
          <span>{t("profiles.add")}</span>
        </button>
      </section>

      <p className="children__hint">
        {canDelete
          ? t("parent.deleteHint")
          : t("parent.lastChildHint")}
      </p>
    </div>
  );
}
