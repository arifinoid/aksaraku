import { Suspense, lazy, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRewards } from "../../app/RewardsContext";
import { AVATAR_PARTS } from "../../data";
import {
  avatarPartName,
  AVATAR_SLOTS,
  defaultAvatarConfig,
  isLocale,
  isPartUnlocked,
  partsForSlot,
  resolveAvatar,
  selectPart,
  type AvatarConfig,
  type AvatarPart,
  type Profile,
} from "../../domain";
import { playPop } from "../../game";
import { runTask } from "../../platform/task";
import { supportsWebgl } from "../../platform/webgl";
import { loadAvatar, saveAvatar } from "../../storage";
import { Screen } from "../../ui";
import "./avatar.css";

const LazyAvatar3D = lazy(() => import("./Avatar3DScene"));

const SLOT_EMOJI: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  ears: { round: "🟡", pointy: "🔺", floppy: "🍃", horn: "🌙" },
  eyes: { dot: "⚫", happy: "😊", sparkle: "✨" },
  accessory: { none: "🚫", hat: "🎩", bow: "🎀", glasses: "👓", crown: "👑" },
};

export interface AvatarScreenProps {
  readonly profile: Profile;
  readonly onBack: () => void;
}

export function AvatarScreen({ profile, onBack }: AvatarScreenProps) {
  const { t, i18n } = useTranslation();
  const { unlockedIds } = useRewards();
  const [config, setConfig] = useState<AvatarConfig>(() =>
    defaultAvatarConfig(AVATAR_PARTS),
  );
  const locale = isLocale(i18n.language) ? i18n.language : "id";
  const avatar = resolveAvatar(config, AVATAR_PARTS);

  useEffect(() => {
    void (async () => {
      const result = await runTask(loadAvatar(profile.id));
      if (result._tag === "Right" && result.right) setConfig(result.right);
    })();
  }, [profile.id]);

  const choose = (part: AvatarPart) => {
    const next = selectPart(config, part, unlockedIds);
    if (!next) return;
    setConfig(next);
    void runTask(saveAvatar(profile.id, next));
    playPop(true);
  };

  return (
    <Screen title={t("avatar.title")} onBack={onBack}>
      <div className="avatar__stage">
        {supportsWebgl() ? (
          <Suspense fallback={<div className="avatar__fallback">🐻</div>}>
            <LazyAvatar3D avatar={avatar} />
          </Suspense>
        ) : (
          <div className="avatar__fallback">🐻</div>
        )}
      </div>

      {AVATAR_SLOTS.map((slot) => (
        <section key={slot} className="panel">
          <h2 className="panel__title">{t(`avatar.slot.${slot}`)}</h2>
          <div className="avatar__options">
            {partsForSlot(AVATAR_PARTS, slot).map((part) => {
              const unlocked = isPartUnlocked(part, unlockedIds);
              const active = config[slot] === part.id;
              const classes = [
                "avatar__option",
                active ? "avatar__option--active" : "",
                unlocked ? "" : "avatar__option--locked",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={part.id}
                  type="button"
                  className={classes}
                  disabled={!unlocked}
                  onClick={() => choose(part)}
                >
                  <span
                    className="avatar__swatch"
                    style={slot === "color" ? { background: part.value } : undefined}
                    aria-hidden="true"
                  >
                    {slot === "color"
                      ? ""
                      : unlocked
                        ? (SLOT_EMOJI[slot]?.[part.value] ?? "✓")
                        : "🔒"}
                  </span>
                  <span className="avatar__option-name">
                    {avatarPartName(part, locale)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </Screen>
  );
}
