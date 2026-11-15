import {
  ArrowLeft,
  Cat,
  CircleCheck,
  Crown,
  Flower,
  Gift,
  Heart,
  Lock,
  PartyPopper,
  Rainbow,
  Sparkles,
  Star,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  isLocale,
  requirementLabelKey,
  requirementProgress,
  rewardName,
  type RewardDefinition,
  type RewardKind,
} from "../../domain";
import { useRewards } from "../../app/RewardsContext";
import { Icon } from "../../ui";
import "./rewards.css";

const KINDS: readonly RewardKind[] = ["sticker", "trophy", "character"];

/*
 * Rebuilt to pen.dev frames 11 (mobile) and d5 (desktop): the summary is
 * three tinted counters, the grid is one white card per reward, unlocked
 * cards carry the brand tint and a "Terbuka" pill, locked ones track
 * requirement progress.
 */

/** Line icon standing in for the reward emblem. */
const REWARD_ICONS: Readonly<Record<string, LucideIcon>> = {
  "sticker-star": Star,
  "sticker-heart": Heart,
  "sticker-rainbow": Rainbow,
  "sticker-flower": Flower,
  "sticker-butterfly": Sparkles,
  "sticker-balloon": PartyPopper,
  "trophy-bronze": Trophy,
  "trophy-silver": Trophy,
  "trophy-gold": Trophy,
  "trophy-star": Star,
  "trophy-crown": Crown,
  "character-cat": Cat,
  "character-bear": Heart,
  "character-fox": Sparkles,
  "character-panda": Sparkles,
};

/** Soft background tone behind an unlocked card and its emblem colour. */
const REWARD_TONES: Readonly<Record<string, "mango" | "coral" | "sky" | "leaf" | "grape">> = {
  "sticker-star": "mango",
  "sticker-heart": "coral",
  "sticker-rainbow": "sky",
  "sticker-flower": "grape",
  "trophy-star": "mango",
  "trophy-gold": "mango",
  "trophy-bronze": "sky",
  "trophy-silver": "grape",
  "trophy-crown": "mango",
  "character-cat": "coral",
  "character-fox": "coral",
  "character-bear": "mango",
  "character-panda": "sky",
};

export interface CollectionScreenProps {
  readonly onBack: () => void;
}

export function CollectionScreen({ onBack }: CollectionScreenProps) {
  const { t, i18n } = useTranslation();
  const { definitions, unlockedIds, stats } = useRewards();
  const locale = isLocale(i18n.language) ? i18n.language : "id";
  const unlocked = new Set(unlockedIds);
  const [activeKind, setActiveKind] = useState<RewardKind>("sticker");

  const card = (definition: RewardDefinition) => {
    const isUnlocked = unlocked.has(definition.id);
    const tone = REWARD_TONES[definition.id] ?? "mango";
    const glyph = REWARD_ICONS[definition.id] ?? Gift;
    const { current, target } = requirementProgress(
      definition.requirement,
      stats,
    );
    return (
      <figure
        key={definition.id}
        className={`reward-card${isUnlocked ? ` reward-card--unlocked reward-card--${tone}` : ""}`}
      >
        {isUnlocked ? null : (
          <span className="reward-card__lock" aria-hidden="true">
            <Icon glyph={Lock} size={13} />
          </span>
        )}

        <span className="reward-card__medal" aria-hidden="true">
          <Icon glyph={glyph} size={26} />
        </span>

        <figcaption className="reward-card__name">
          {rewardName(definition, locale)}
        </figcaption>

        {isUnlocked ? (
          <span className="reward-card__open">
            <Icon glyph={CircleCheck} size={13} />
            {t("rewards.openBadge")}
          </span>
        ) : (
          <span className="reward-card__meta">
            <span className="reward-card__requirement">
              {t("rewards.lockedPrefix")}
              {t(requirementLabelKey(definition.requirement), { count: target })}
            </span>
            <span className="reward-card__track">
              <span
                className="reward-card__fill"
                style={{ width: `${Math.min(100, Math.round((current / target) * 100))}%` }}
              />
            </span>
            <span className="reward-card__count">
              {Math.min(current, target)}/{target}
            </span>
          </span>
        )}
      </figure>
    );
  };

  return (
    <div className="collection">
      <header className="collection__top">
        <button type="button" className="back-pill" onClick={onBack}>
          <Icon glyph={ArrowLeft} size={16} />
          <span>{t("common.back")}</span>
        </button>
        <h1 className="collection__title">{t("rewards.title")}</h1>
      </header>

      <p className="collection__sub collection__sub--desktop">
        {t("rewards.sub")}
      </p>

      <div className="collection__summary">
        <div className="collection-counter collection-counter--grape">
          <span className="collection-counter__copy">
            <span className="collection-counter__value">
              {definitions.filter((d) => d.kind === "sticker").filter((d) => unlocked.has(d.id)).length}
              /{definitions.filter((d) => d.kind === "sticker").length}
            </span>
            <span className="collection-counter__label">{t("rewards.kind.sticker")}</span>
          </span>
          <Icon glyph={Star} size={20} className="collection-counter__icon" />
        </div>
        <div className="collection-counter collection-counter--mango">
          <span className="collection-counter__copy">
            <span className="collection-counter__value">
              {definitions.filter((d) => d.kind === "trophy").filter((d) => unlocked.has(d.id)).length}
              /{definitions.filter((d) => d.kind === "trophy").length}
            </span>
            <span className="collection-counter__label">{t("rewards.kind.trophy")}</span>
          </span>
          <Icon glyph={Trophy} size={20} className="collection-counter__icon" />
        </div>
        <div className="collection-counter collection-counter--leaf">
          <span className="collection-counter__copy">
            <span className="collection-counter__value">
              {definitions.filter((d) => d.kind === "character").filter((d) => unlocked.has(d.id)).length}
              /{definitions.filter((d) => d.kind === "character").length}
            </span>
            <span className="collection-counter__label">{t("rewards.kind.character")}</span>
          </span>
          <Icon glyph={Cat} size={20} className="collection-counter__icon" />
        </div>
      </div>

      <div className="collection__tabrow">
        <div className="collection__tabs" role="tablist">
          {KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              role="tab"
              aria-selected={kind === activeKind}
              className={`collection__tab${kind === activeKind ? " collection__tab--active" : ""}`}
              onClick={() => setActiveKind(kind)}
            >
              {t(`rewards.kind.${kind}`)}
            </button>
          ))}
        </div>
        <span className="collection__opennote">
          {t("rewards.openCount", { count: unlockedIds.length, total: definitions.length })}
        </span>
      </div>

      <section className="collection__section">
        <div className="rewards__grid motion-stagger">
          {definitions
            .filter((definition) => definition.kind === activeKind)
            .map(card)}
        </div>
      </section>

      <div className="collection__next">
        <span className="collection__next-icon" aria-hidden="true">
          <Icon glyph={Gift} size={20} />
        </span>
        <div className="collection__next-copy">
          <h2 className="collection__next-title">
            {t("rewards.nextRewardTitle")}
          </h2>
          <p className="collection__next-sub">
            {t("rewards.nextRewardSub", { count: 3 })}
          </p>
        </div>
        <span className="collection__next-track">
          <span
            className="collection__next-fill"
            style={{ width: `${Math.min(100, Math.round((stats.starsEarned / 3) * 100))}%` }}
          />
        </span>
        <span className="collection__next-count">
          {t("home.reward.count", {
            current: stats.starsEarned,
            target: 3,
          })}
        </span>
      </div>

      <p className="collection__footer">{t("rewards.footer")}</p>
    </div>
  );
}
