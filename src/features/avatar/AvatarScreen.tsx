import {
  ArrowLeft,
  Ban,
  Check,
  ChevronDown,
  Circle,
  CircleDot,
  CircleOff,
  Crown,
  Ear,
  Glasses,
  HardHat,
  Mountain,
  Ribbon,
  Smile,
  Sparkles,
  Triangle,
  type LucideIcon,
} from "lucide-react";
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
  type AvatarSlot,
  type Profile,
} from "../../domain";
import { playPop } from "../../game";
import { runTask } from "../../platform/task";
import { supportsWebgl } from "../../platform/webgl";
import { loadAvatar, saveAvatar } from "../../storage";
import { Icon } from "../../ui";
import "./avatar.css";

const LazyAvatar3D = lazy(() => import("./Avatar3DScene"));

/*
 * Rebuilt to pen.dev frames 12 (mobile) and d6 (desktop): the slot cards
 * use line icons instead of emoji, the colour slot is a row of plain
 * swatch circles, and the chosen option carries the mango highlight.
 */

const SLOT_ICONS: Readonly<Record<AvatarSlot, Readonly<Record<string, LucideIcon>>>> = {
  color: {},
  ears: {
    round: Circle,
    pointy: Triangle,
    long: Ear,
    floppy: ChevronDown,
    horn: Mountain,
    none: CircleOff,
  },
  eyes: {
    dot: CircleDot,
    happy: Smile,
    sparkle: Sparkles,
  },
  accessory: {
    none: Ban,
    hat: HardHat,
    bow: Ribbon,
    glasses: Glasses,
    crown: Crown,
  },
};

const SPECIES_KEY: Readonly<Record<string, string>> = {
  cat: "avatar.species.cat",
  bear: "avatar.species.bear",
  rabbit: "avatar.species.rabbit",
  fox: "avatar.species.fox",
  panda: "avatar.species.panda",
  frog: "avatar.species.frog",
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

  const speciesName = () => {
    const key = SPECIES_KEY[profile.avatarId];
    return key ? t(key) : avatarEmoji(profile.avatarId);
  };

  return (
    <div className="avatar">
      <header className="avatar__top">
        <button type="button" className="back-pill" onClick={onBack}>
          <Icon glyph={ArrowLeft} size={16} />
          <span>{t("common.back")}</span>
        </button>
        <h1 className="avatar__title">{t("avatar.title")}</h1>
      </header>

      <div className="avatar__layout">
        <div className="avatar__stage-col">
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

          <span className="avatar__species">
            {speciesName()}
            <span className="avatar__species-dot" aria-hidden="true" />
          </span>
          <span className="avatar__stage-caption">{t("avatar.buddy")}</span>

          <section className="avatar-info">
            <h2 className="avatar-info__title">{t("avatar.autoSaveTitle")}</h2>
            <p className="avatar-info__body">{t("avatar.autoSaveBody")}</p>
          </section>

          <button type="button" className="avatar-save" onClick={() => playPop(true)}>
            <span>{t("avatar.save")}</span>
            <Icon glyph={Check} size={16} />
          </button>
        </div>

        <div className="avatar__sections">
          {AVATAR_SLOTS.map((slot) => {
            const current = partsForSlot(AVATAR_PARTS, slot).find(
              (part) => part.id === config[slot],
            );
            return (
              <section key={slot} className="avatar-slot">
                <div className="avatar-slot__head">
                  <h2 className="avatar-slot__title">{t(`avatar.slot.${slot}`)}</h2>
                  <span className="avatar-slot__value">
                    {current ? avatarPartName(current, locale) : ""}
                  </span>
                </div>

                {slot === "color" ? (
                  <div className="avatar-colors">
                    {partsForSlot(AVATAR_PARTS, slot).map((part) => {
                      const unlocked = isPartUnlocked(part, unlockedIds);
                      const active = config[slot] === part.id;
                      return (
                        <button
                          key={part.id}
                          type="button"
                          className={`swatch-circle${active ? " swatch-circle--active" : ""}`}
                          style={{ background: part.value }}
                          disabled={!unlocked}
                          aria-pressed={active}
                          aria-label={avatarPartName(part, locale)}
                          title={avatarPartName(part, locale)}
                          onClick={() => choose(part)}
                        >
                          {active ? <Icon glyph={Check} size={18} /> : null}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className={`avatar-opts avatar-opts--${slot}`}>
                    {partsForSlot(AVATAR_PARTS, slot).map((part) => {
                      const unlocked = isPartUnlocked(part, unlockedIds);
                      const active = config[slot] === part.id;
                      const Glyph = SLOT_ICONS[slot][part.value];
                      return (
                        <button
                          key={part.id}
                          type="button"
                          className={`avatar-opt${active ? " avatar-opt--active" : ""}`}
                          disabled={!unlocked}
                          onClick={() => choose(part)}
                        >
                          <span className="avatar-opt__icon" aria-hidden="true">
                            {Glyph ? <Icon glyph={Glyph} size={22} /> : null}
                          </span>
                          <span className="avatar-opt__label">
                            {avatarPartName(part, locale)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
