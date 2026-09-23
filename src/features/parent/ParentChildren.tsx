import { useState } from "react";
import { useTranslation } from "react-i18next";
import { avatarEmoji } from "../../data/avatars";
import type { Profile } from "../../domain";
import { Button, Screen } from "../../ui";
import "./parent.css";

export interface ParentChildrenProps {
  readonly profiles: readonly Profile[];
  readonly current: Profile;
  readonly onSelect: (profile: Profile) => void;
  readonly onDelete: (profile: Profile) => void;
  readonly onBack: () => void;
}

export function ParentChildren({
  profiles,
  current,
  onSelect,
  onDelete,
  onBack,
}: ParentChildrenProps) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState<string | null>(null);
  const canDelete = profiles.length > 1;

  return (
    <Screen title={t("parent.manageChildren")} onBack={onBack}>
      <ul className="child-list">
        {profiles.map((profile) => (
          <li key={profile.id} className="child-row panel">
            <span className="child-row__avatar" aria-hidden="true">
              {avatarEmoji(profile.avatarId)}
            </span>
            <span className="child-row__name">
              {profile.name}
              {profile.id === current.id ? (
                <span className="child-row__badge">
                  {t("parent.activeChild")}
                </span>
              ) : null}
            </span>

            {confirming === profile.id ? (
              <span className="child-row__actions">
                <Button
                  label={t("parent.deleteConfirm")}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setConfirming(null);
                    onDelete(profile);
                  }}
                />
                <Button
                  label={t("parent.cancel")}
                  variant="secondary"
                  size="sm"
                  onClick={() => setConfirming(null)}
                />
              </span>
            ) : (
              <span className="child-row__actions">
                {profile.id === current.id ? null : (
                  <Button
                    label={t("parent.switchTo")}
                    variant="secondary"
                    size="sm"
                    onClick={() => onSelect(profile)}
                  />
                )}
                <Button
                  label={t("parent.delete")}
                  variant="ghost"
                  size="sm"
                  disabled={!canDelete}
                  onClick={() => setConfirming(profile.id)}
                />
              </span>
            )}
          </li>
        ))}
      </ul>

      {canDelete ? (
        <p className="panel__hint">{t("parent.deleteHint")}</p>
      ) : (
        <p className="panel__hint">{t("parent.lastChildHint")}</p>
      )}
    </Screen>
  );
}
