import { ArrowLeft, Sparkles } from "lucide-react";
import { Suspense, lazy, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRewards } from "../../app/RewardsContext";
import { AVATAR_PARTS } from "../../data";
import { avatarEmoji } from "../../data/avatars";
import { defaultAvatarFor } from "../../data/species";
import {
  avatarPartName,
  AVATAR_SLOTS,
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
import { Icon } from "../../ui";
import "./avatar.css";

const LazyAvatar3D = lazy(() => import("./Avatar3DScene"));

const SLOT_EMOJI: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  ears: {
    round: "🟡",
    pointy: "🔺",
    floppy: "🍃",
    horn: "🌙",
    long: "🐰",
    none: "🚫",
  },
  eyes: { dot: "⚫", happy: "😊", sparkle: "✨" },
  accessory: { none: "🚫", hat: "🎩", bow: "🎀", glasses: "👓", crown: "👑" },
};

export interface AvatarScreenProps {
  readonly profile: Profile;
  readonly reduceMotion: boolean;
  readonly onBack: () => void;
}

export function AvatarScreen({
  profile,
  reduceMotion,
  onBack,
}: AvatarScreenProps) {
  const { t, i18n } = useTranslation();
  const { unlockedIds } = useRewards();
  const [config, setConfig] = useState<AvatarConfig>(() =>
    defaultAvatarFor(AVATAR_PARTS, profile.avatarId),
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
    <div className="avatar">
      <header className="avatar__top">
        <button type="button" className="avatar__back" onClick={onBack}>
          <Icon glyph={ArrowLeft} size={16} />
          <span>{t("common.back")}</span>
        </button>

        <div className="avatar__titles">
          <h1 className="avatar__title">{t("avatar.title")}</h1>
          <p className="avatar__sub">{t("avatar.pick")}</p>
        </div>

        <div className="avatar__meta" />
      </header>

      <div className="avatar__body">
        <div className="avatar__stage">
          {supportsWebgl() ? (
            <Suspense
              fallback={
                <div className="avatar__fallback">
                  {avatarEmoji(profile.avatarId)}
                </div>
              }
            >
              <LazyAvatar3D
                avatar={avatar}
                species={profile.avatarId}
                reduceMotion={reduceMotion}
              />
            </Suspense>
          ) : (
            <div className="avatar__fallback">
              {avatarEmoji(profile.avatarId)}
            </div>
          )}
        </div>

        <div className="avatar__sections">
          {AVATAR_SLOTS.map((slot) => (
            <section key={slot} className="avatar__section">
              <h2 className="avatar__section-title">{t(`avatar.slot.${slot}`)}</h2>
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
        </div>
      </div>

      <p className="avatar__footer">
        <Icon glyph={Sparkles} size={13} />
        {t("avatar.footer")}
      </p>
    </div>
  );
}
