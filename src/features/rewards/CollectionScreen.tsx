import { useTranslation } from "react-i18next";
import {
  isLocale,
  requirementLabelKey,
  requirementProgress,
  rewardName,
  type RewardKind,
} from "../../domain";
import { useRewards } from "../../app/RewardsContext";
import { Screen } from "../../ui";
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

  return (
    <Screen title={t("rewards.title")} onBack={onBack}>
      {KINDS.map((kind) => (
        <section key={kind} className="panel">
          <h2 className="panel__title">{t(`rewards.kind.${kind}`)}</h2>
          <div className="rewards__grid">
            {definitions
              .filter((definition) => definition.kind === kind)
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
      ))}
    </Screen>
  );
}
