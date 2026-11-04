import { ArrowLeft, Gift, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  isLocale,
  requirementLabelKey,
  requirementProgress,
  rewardName,
  type RewardKind,
} from "../../domain";
import { useRewards } from "../../app/RewardsContext";
import { Icon } from "../../ui";
import "./rewards.css";

const KINDS: readonly RewardKind[] = ["sticker", "trophy", "character"];

export interface CollectionScreenProps {
  readonly onBack: () => void;
}

export function CollectionScreen({ onBack }: CollectionScreenProps) {
  const { t, i18n } = useTranslation();
  const { definitions, unlockedIds, stats } = useRewards();
  const locale = isLocale(i18n.language) ? i18n.language : "id";
  const unlocked = new Set(unlockedIds);
  const [activeKind, setActiveKind] = useState<RewardKind>("sticker");

  return (
    <div className="collection">
      <header className="collection__top">
        <button type="button" className="collection__back" onClick={onBack}>
          <Icon glyph={ArrowLeft} size={16} />
          <span>{t("common.back")}</span>
        </button>

        <div className="collection__titles">
          <h1 className="collection__title">{t("rewards.title")}</h1>
          <p className="collection__sub">{t("rewards.pick")}</p>
        </div>

        <div className="collection__meta">
          <span className="collection__pill">
            <Icon glyph={Star} size={14} className="collection__pill-icon" />
            {stats.starsEarned}
          </span>
        </div>
      </header>

      <div className="collection__summary">
        <Icon glyph={Gift} size={18} className="collection__summary-icon" />
        <span className="collection__summary-text">
          {t("rewards.summary", {
            unlocked: unlockedIds.length,
            total: definitions.length,
          })}
        </span>
      </div>

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

      <section className="collection__section">
        <div className="rewards__grid motion-stagger">
          {definitions
            .filter((definition) => definition.kind === activeKind)
            .map((definition) => {
              const isUnlocked = unlocked.has(definition.id);
              const { current, target } = requirementProgress(
                definition.requirement,
                stats,
              );
              return (
                <figure
                  key={definition.id}
                  className={`reward-card${
                    isUnlocked ? " reward-card--unlocked" : ""
                  }`}
                >
                  <span className="reward-card__emoji" aria-hidden="true">
                    {isUnlocked ? definition.emoji : "🔒"}
                  </span>
                  <figcaption className="reward-card__name">
                    {isUnlocked
                      ? rewardName(definition, locale)
                      : t("rewards.locked")}
                  </figcaption>
                  <span className="reward-card__progress">
                    {isUnlocked
                      ? t("rewards.done")
                      : `${Math.min(current, target)}/${target}`}
                  </span>
                  {isUnlocked ? null : (
                    <span className="reward-card__requirement">
                      {t(requirementLabelKey(definition.requirement), {
                        count: target,
                      })}
                    </span>
                  )}
                </figure>
              );
            })}
        </div>
      </section>

      <p className="collection__footer">
        <Icon glyph={Sparkles} size={13} />
        {t("rewards.footer")}
      </p>
    </div>
  );
}