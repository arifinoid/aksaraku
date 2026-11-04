import {
  ArrowRight,
  ArrowUpRight,
  Cat,
  Flame,
  Gift,
  Lock,
  Pencil,
  Puzzle,
  Sparkles,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRewards } from "../../app/RewardsContext";
import type { Route } from "../../app/routes";
import {
  avatarEmoji,
  GLYPH_ITEMS,
  itemsByKind,
  objectEntry,
  categoryLabelKey,
} from "../../data";
import {
  masteryLevel,
  requirementLabelKey,
  requirementProgress,
  type ModuleKind,
  type Profile,
} from "../../domain";
import { useActiveLocale } from "../../i18n";
import { Icon } from "../../ui";
import { AvatarPortrait } from "./AvatarPortrait";
import { currentStreak } from "./streak";
import "./home.css";

export interface HomeScreenProps {
  readonly profile: Profile;
  readonly reduceMotion: boolean;
  readonly onNavigate: (route: Route) => void;
  readonly onParent: () => void;
  readonly onSwitchProfile: () => void;
}

type Tone = "coral" | "sky" | "mango" | "leaf";

interface MenuItem {
  readonly key: "tracing" | "games" | "rewards" | "avatar";
  readonly tone: Tone;
  readonly icon: LucideIcon;
  readonly route: Route;
}

const MENU: readonly MenuItem[] = [
  {
    key: "tracing",
    tone: "coral",
    icon: Pencil,
    route: { name: "play" },
  },
  {
    key: "games",
    tone: "sky",
    icon: Puzzle,
    route: { name: "games" },
  },
  {
    key: "rewards",
    tone: "mango",
    icon: Star,
    route: { name: "collection" },
  },
  {
    key: "avatar",
    tone: "leaf",
    icon: Cat,
    route: { name: "avatar" },
  },
];

const LETTER_KINDS: readonly ModuleKind[] = ["letter-upper", "letter-lower"];

const masteredIn = (
  kinds: readonly ModuleKind[],
  masteredByKind: Readonly<Record<ModuleKind, number>>,
): number => kinds.reduce((sum, kind) => sum + masteredByKind[kind], 0);

const totalIn = (kinds: readonly ModuleKind[]): number =>
  kinds.reduce((sum, kind) => sum + itemsByKind(kind).length, 0);

export function HomeScreen({
  profile,
  reduceMotion,
  onNavigate,
  onParent,
  onSwitchProfile,
}: HomeScreenProps) {
  const { t } = useTranslation();
  const locale = useActiveLocale();
  const { stats, mastery, definitions, isUnlocked } = useRewards();

  const masteredByItem = new Map(
    mastery.map((entry) => [
      entry.itemId,
      masteryLevel(entry.score, entry.attempts),
    ]),
  );

  const nextItem =
    GLYPH_ITEMS.find((item) => masteredByItem.get(item.id) !== "mastered") ??
    GLYPH_ITEMS[0];

  const nextObject = nextItem ? objectEntry(nextItem.glyph) : undefined;
  const nextObjectName = nextObject
    ? (nextObject.names[locale] ?? nextObject.names.id)
    : undefined;
  const nextKindLabel = nextItem ? t(categoryLabelKey(nextItem.kind)) : "";
  const nextTitle = nextItem
    ? nextObjectName
      ? t("play.objectHint", {
          glyph: nextItem.glyph,
          object: nextObjectName,
        })
      : `${nextKindLabel} ${nextItem.glyph}`
    : "";

  const nextKindTotal = nextItem ? itemsByKind(nextItem.kind).length : 0;
  const nextKindMastered =
    nextItem && nextItem.kind ? stats.masteredByKind[nextItem.kind] : 0;
  const nextFill = nextKindTotal
    ? Math.round((nextKindMastered / nextKindTotal) * 100)
    : 0;

  const nextReward =
    definitions.find((definition) => {
      if (isUnlocked(definition.id)) return false;
      const { current, target } = requirementProgress(
        definition.requirement,
        stats,
      );
      return current < target;
    }) ?? definitions[definitions.length - 1];

  const rewardProgress = nextReward
    ? requirementProgress(nextReward.requirement, stats)
    : { current: 0, target: 0 };
  const rewardFill = rewardProgress.target
    ? Math.min(
        100,
        Math.round((rewardProgress.current / rewardProgress.target) * 100),
      )
    : 0;

  const streak = currentStreak(mastery.map((entry) => entry.lastSeenAt));

  const lettersMastered = masteredIn(LETTER_KINDS, stats.masteredByKind);
  const lettersTotal = totalIn(LETTER_KINDS);
  const numbersMastered = stats.masteredByKind.digit;
  const numbersTotal = itemsByKind("digit").length;
  const shapesMastered = stats.masteredByKind.shape;
  const shapesTotal = itemsByKind("shape").length;

  const totalMastered = stats.itemsMastered;
  const totalItems = GLYPH_ITEMS.length;
  const progressFill = totalItems
    ? Math.round((totalMastered / totalItems) * 100)
    : 0;

  const avatar = (
    <span className="home__avatar" aria-hidden="true">
      {avatarEmoji(profile.avatarId)}
    </span>
  );

  return (
    <div className="home">
      <header className="home__header">
        <div className="home__greeting">
          <span className="home__greeting-avatar" aria-hidden="true">
            {avatarEmoji(profile.avatarId)}
          </span>
          <div className="home__title-col">
            <h1 className="home__title">
              {t("home.greeting", { name: profile.name })}
            </h1>
            <p className="home__subtitle">{t("home.subtitle")}</p>
          </div>
        </div>

        <div className="home__header-right">
          <span className="home__pill">
            <Icon glyph={Flame} size={14} className="home__pill-icon" />
            {t("home.streak", { count: streak })}
          </span>
          <span className="home__pill">
            <Icon
              glyph={Star}
              size={14}
              className="home__pill-icon home__pill-icon--star"
            />
            {stats.starsEarned}
          </span>
          {avatar}
        </div>

        <button
          type="button"
          className="home__parent"
          onClick={onParent}
        >
          <Icon glyph={Lock} size={12} className="home__parent-icon" />
          {t("nav.parent")}
        </button>
      </header>

      <section className="hero" aria-label={t("home.continue.eyebrow")}>
        <span className="hero__glow hero__glow--a" aria-hidden="true" />
        <span className="hero__glow hero__glow--b" aria-hidden="true" />
        <div className="hero__copy">
          <p className="hero__eyebrow">{t("home.continue.eyebrow")}</p>
          <h2 className="hero__title">{nextTitle}</h2>
          <p className="hero__sub">
            {t("home.continue.detail", {
              category: nextKindLabel,
              current: nextKindMastered,
              total: nextKindTotal,
            })}
          </p>
          <div
            className="hero__track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={nextKindTotal}
            aria-valuenow={nextKindMastered}
          >
            <span
              className="hero__fill"
              style={{ width: `${Math.max(2, nextFill)}%` }}
            />
          </div>
          <button
            type="button"
            className="hero__cta"
            onClick={() => onNavigate({ name: "play" })}
          >
            {t("home.continue.cta")}
            <Icon glyph={ArrowRight} size={15} />
          </button>
        </div>

        <div className="hero__mascot">
          <AvatarPortrait
            profileId={profile.id}
            reduceMotion={reduceMotion}
            fallback={avatarEmoji(profile.avatarId)}
            label={profile.name}
          />
        </div>

        <Icon glyph={Sparkles} size={16} className="hero__spark hero__spark--1" />
        <Icon glyph={Sparkles} size={12} className="hero__spark hero__spark--2" />
        <Icon glyph={Sparkles} size={10} className="hero__spark hero__spark--3" />
        <Icon glyph={Sparkles} size={14} className="hero__spark hero__spark--4" />
      </section>

      <p className="home__stats">
        <Icon
          glyph={Star}
          size={15}
          className="home__stats-icon"
        />
        <span className="home__stats-strong">
          {t("home.stats.stars", { count: stats.starsEarned })}
        </span>
        <span className="home__dot" aria-hidden="true" />
        <span>
          {t("home.stats.progress", {
            current: totalMastered,
            total: totalItems,
          })}
        </span>
      </p>

      <nav className="home__grid" aria-label={t("nav.mainLabel")}>
        {MENU.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`home-tile home-tile--${item.tone}`}
            onClick={() => onNavigate(item.route)}
          >
            <span className="home-tile__top">
              <span className="home-tile__badge">
                <Icon glyph={item.icon} size={24} />
              </span>
              <Icon
                glyph={ArrowUpRight}
                size={18}
                className="home-tile__arrow"
              />
            </span>
            <span className="home-tile__copy">
              <span className="home-tile__title">{t(`home.${item.key}`)}</span>
              <span className="home-tile__hint">
                {t(`home.hint.${item.key}`)}
              </span>
            </span>
          </button>
        ))}
      </nav>

      <div className="home__bottom">
        <section className="progress-card">
          <h2 className="progress-card__title">{t("home.progress.title")}</h2>
          <p className="progress-card__sub">
            {t("home.progress.sub", {
              current: totalMastered,
              total: totalItems,
            })}
          </p>
          <div
            className="progress-card__track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalItems}
            aria-valuenow={totalMastered}
          >
            <span
              className="progress-card__fill"
              style={{ width: `${Math.max(1, progressFill)}%` }}
            />
          </div>
          <ul className="progress-card__legend">
            <li>
              <span className="legend-dot legend-dot--coral" />
              {t("home.progress.letters", {
                current: lettersMastered,
                total: lettersTotal,
              })}
            </li>
            <li>
              <span className="legend-dot legend-dot--teal" />
              {t("home.progress.numbers", {
                current: numbersMastered,
                total: numbersTotal,
              })}
            </li>
            <li>
              <span className="legend-dot legend-dot--mango" />
              {t("home.progress.shapes", {
                current: shapesMastered,
                total: shapesTotal,
              })}
            </li>
          </ul>
        </section>

        <section className="next-reward">
          <div className="next-reward__head">
            <span className="next-reward__left">
              <Icon glyph={Gift} size={18} className="next-reward__icon" />
              <h2 className="next-reward__title">{t("home.reward.title")}</h2>
            </span>
            <span className="next-reward__count">
              {t("home.reward.count", {
                current: Math.min(
                  rewardProgress.current,
                  rewardProgress.target,
                ),
                target: rewardProgress.target,
              })}
            </span>
          </div>
          <p className="next-reward__sub">
            {nextReward
              ? t(requirementLabelKey(nextReward.requirement), {
                  count: rewardProgress.target,
                })
              : null}
          </p>
          <div
            className="next-reward__track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={rewardProgress.target}
            aria-valuenow={Math.min(
              rewardProgress.current,
              rewardProgress.target,
            )}
          >
            <span
              className="next-reward__fill"
              style={{ width: `${Math.max(2, rewardFill)}%` }}
            />
          </div>
        </section>

        <section className="reward-teaser" aria-label={t("home.reward.title")}>
          <span className="reward-teaser__icon">
            <Icon glyph={Gift} size={17} />
          </span>
          <span className="reward-teaser__text">
            {nextReward
              ? t(requirementLabelKey(nextReward.requirement), {
                  count: rewardProgress.target,
                })
              : null}
          </span>
          <span className="reward-teaser__count">
            {t("home.reward.count", {
              current: Math.min(rewardProgress.current, rewardProgress.target),
              target: rewardProgress.target,
            })}
          </span>
        </section>
      </div>

      <button
        type="button"
        className="home__switch"
        onClick={onSwitchProfile}
      >
        <Icon glyph={Users} size={14} />
        {t("parent.switchProfile")}
      </button>
    </div>
  );
}
