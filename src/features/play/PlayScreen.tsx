import { ChevronLeft, ChevronRight, Flame, Hand, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRewards } from "../../app/RewardsContext";
import {
  avatarEmoji,
  categoryLabelKey,
  findGlyphItem,
  GLYPH_CATEGORIES,
  itemsByKind,
  objectEntry,
} from "../../data";
import {
  masteryLevel,
  type AppSettings,
  type MasteryLevel,
  type ModuleItem,
  type ModuleKind,
  type Profile,
} from "../../domain";
import { unlockAudio } from "../../game";
import { useActiveLocale } from "../../i18n";
import { Icon } from "../../ui";
import { ColoringGameScreen } from "../games/ColoringGameScreen";
import { currentStreak } from "../home/streak";
import { TracingScreen } from "./TracingScreen";
import "./play.css";

export interface PlayScreenProps {
  readonly profile: Profile;
  readonly settings: AppSettings;
  readonly onBack: () => void;
}

type PlayView =
  | { readonly kind: "picker" }
  | { readonly kind: "trace"; readonly id: string }
  | { readonly kind: "color"; readonly id: string };

/** How many picked-for-you cards the desktop picker shows. */
const RECOMMENDATION_COUNT = 3;

/** The unit after the count in the picker's progress row. */
const UNIT_KEY: Readonly<Record<ModuleKind, string>> = {
  "letter-upper": "play.unitUpper",
  "letter-lower": "play.unitLower",
  digit: "play.unitDigit",
  shape: "play.unitShape",
};

export function PlayScreen({ profile, settings, onBack }: PlayScreenProps) {
  const { t } = useTranslation();
  const locale = useActiveLocale();
  const { mastery, stats } = useRewards();
  const [category, setCategory] = useState<ModuleKind>("letter-upper");
  const [view, setView] = useState<PlayView>({ kind: "picker" });

  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  const levels = useMemo(() => {
    const map = new Map<string, MasteryLevel>();
    for (const entry of mastery) {
      map.set(entry.itemId, masteryLevel(entry.score, entry.attempts));
    }
    return map;
  }, [mastery]);

  const items = useMemo(() => itemsByKind(category), [category]);
  const masteredInCategory = stats.masteredByKind[category];
  const progressFill = items.length
    ? Math.round((masteredInCategory / items.length) * 100)
    : 0;
  const streak = currentStreak(mastery.map((entry) => entry.lastSeenAt));

  /** The first few glyphs the child has not mastered yet, in teaching order. */
  const recommendations = useMemo(
    () =>
      items
        .filter((item) => levels.get(item.id) !== "mastered")
        .slice(0, RECOMMENDATION_COUNT),
    [items, levels],
  );

  const levelOf = (item: ModuleItem): MasteryLevel =>
    levels.get(item.id) ?? "new";

  /** The card title in plain words: "A untuk Apel" or "Lingkaran". */
  const titleOf = (item: ModuleItem): string => {
    if (item.kind === "shape") {
      return t(`play.shape.${item.id.slice("shape-".length)}`);
    }
    const object = objectEntry(item.glyph);
    const name = object ? (object.names[locale] ?? object.names.id) : "";
    return name
      ? t("play.objectHint", { glyph: item.glyph, object: name })
      : `${t(categoryLabelKey(item.kind))} ${item.glyph}`;
  };

  if (view.kind === "trace") {
    const selected = findGlyphItem(view.id);
    if (selected) {
      const index = items.findIndex((entry) => entry.id === selected.id);
      const next = items[(index + 1) % items.length] ?? items[0]!;
      return (
        <TracingScreen
          key={selected.id}
          item={selected}
          profile={profile}
          settings={settings}
          siblings={items}
          onBack={() => setView({ kind: "picker" })}
          onSelect={(id) => setView({ kind: "trace", id })}
          onNext={() => setView({ kind: "trace", id: next.id })}
          onColor={() => setView({ kind: "color", id: selected.id })}
        />
      );
    }
  }

  if (view.kind === "color") {
    const selected = findGlyphItem(view.id);
    if (selected) {
      return (
        <ColoringGameScreen
          item={selected}
          profile={profile}
          settings={settings}
          onBack={() => setView({ kind: "picker" })}
        />
      );
    }
  }

  const masterLabel = t("play.masteryLabel", {
    current: masteredInCategory,
    total: items.length,
  });

  return (
    <div className="writing">
      <header className="writing__top">
        <button type="button" className="writing__back" onClick={onBack}>
          <Icon glyph={ChevronLeft} size={16} />
          <span className="writing__back-label">{t("common.back")}</span>
        </button>

        <div className="writing__titles">
          <h1 className="writing__title">{t("play.title")}</h1>
          <p className="writing__sub">{t("play.pick")}</p>
        </div>

        <div className="writing__meta">
          <span className="writing__pill">
            <Icon glyph={Flame} size={14} className="writing__pill-icon" />
            {t("home.streak", { count: streak })}
          </span>
          <span className="writing__pill">
            <Icon
              glyph={Star}
              size={14}
              className="writing__pill-icon writing__pill-icon--star"
            />
            {stats.starsEarned}
          </span>
          <span className="writing__avatar" aria-hidden="true">
            {avatarEmoji(profile.avatarId)}
          </span>
        </div>
      </header>

      <div className="writing__filter">
        <div className="play__tabs" role="tablist" aria-label={t("play.pick")}>
          {GLYPH_CATEGORIES.map((entry) => (
            <button
              key={entry.kind}
              type="button"
              role="tab"
              aria-selected={entry.kind === category}
              className={`play__tab${
                entry.kind === category ? " play__tab--active" : ""
              }`}
              onClick={() => setCategory(entry.kind)}
            >
              {t(categoryLabelKey(entry.kind))}
            </button>
          ))}
        </div>

        <div className="writing__progress">
          <div
            className="writing__track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={items.length}
            aria-valuenow={masteredInCategory}
            aria-label={masterLabel}
          >
            <span
              className="writing__fill"
              style={{ width: `${Math.max(0, progressFill)}%` }}
            />
          </div>
          <span className="writing__progress-label">{masterLabel}</span>
          <span className="writing__progress-note">
            {t(UNIT_KEY[category], { count: items.length })}
          </span>
        </div>
      </div>

      <div className="writing__grid motion-stagger">
        {items.map((item) => {
          const level = levelOf(item);
          return (
            <button
              key={item.id}
              type="button"
              className={`glyph-card glyph-card--${level}`}
              onClick={() => setView({ kind: "trace", id: item.id })}
            >
              <span className="glyph-card__glyph" aria-hidden="true">
                {item.glyph}
              </span>
              <span className="glyph-card__status">
                <span className="glyph-card__dot" aria-hidden="true" />
                <span className="glyph-card__level">
                  {t(`mastery.${level}`)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {recommendations.length > 0 ? (
        <section className="writing__recs" aria-label={t("play.recommendation", {
          name: profile.name,
        })}>
          <div className="writing__recs-head">
            <h2 className="writing__recs-title">
              {t("play.recommendation", { name: profile.name })}
            </h2>
          </div>
          <div className="writing__recs-row">
            {recommendations.map((item) => (
              <button
                key={item.id}
                type="button"
                className="rec-card"
                onClick={() => setView({ kind: "trace", id: item.id })}
              >
                <span
                  className={`rec-card__tile rec-card__tile--${levelOf(item)}`}
                  aria-hidden="true"
                >
                  {item.glyph}
                </span>
                <span className="rec-card__copy">
                  <span className="rec-card__title">{titleOf(item)}</span>
                  <span className="rec-card__sub">
                    {t("play.linesCount", { count: item.strokes.length })}
                  </span>
                </span>
                <Icon
                  glyph={ChevronRight}
                  size={16}
                  className="rec-card__chevron"
                />
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <p className="writing__hint">
        <Icon glyph={Hand} size={13} />
        {t("play.pickerHint")}
      </p>
    </div>
  );
}
