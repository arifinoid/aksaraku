import {
  ArrowLeft,
  Target,
  RefreshCw,
  Star,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  categoryLabelKey,
  findGlyphItem,
  GLYPH_CATEGORIES,
} from "../../data";
import {
  buildReport,
  type MasteryLevel,
  type ModuleKind,
  type Profile,
  type ProgressReport,
} from "../../domain";
import { runTask } from "../../platform/task";
import { listAttempts, listMastery } from "../../storage";
import { Icon } from "../../ui";
import "./parent.css";

const KIND_BY_ITEM = new Map<string, ModuleKind>(
  GLYPH_CATEGORIES.flatMap((category) =>
    category.items.map((item) => [item.id, item.kind] as const),
  ),
);

const TOTAL_BY_KIND: Record<ModuleKind, number> = {
  "letter-upper": 0,
  "letter-lower": 0,
  digit: 0,
  shape: 0,
};

for (const category of GLYPH_CATEGORIES) {
  TOTAL_BY_KIND[category.kind] = category.items.length;
}

const LEVELS: readonly MasteryLevel[] = [
  "mastered",
  "familiar",
  "learning",
  "new",
];

const percent = (value: number, total: number): number =>
  total <= 0 ? 0 : Math.round((value / total) * 100);

const formatDate = (timestamp: number, locale: string): string =>
  new Date(timestamp).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export interface ParentReportProps {
  readonly profile: Profile;
  readonly onBack: () => void;
}

/*
 * Rebuilt to pen.dev frame 15: the summary tiles carry an icon, and the
 * header is the shared back-pill row.
 */
export function ParentReport({ profile, onBack }: ParentReportProps) {
  const { t, i18n } = useTranslation();
  const [report, setReport] = useState<ProgressReport | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const [masteryResult, attemptsResult] = await Promise.all([
        runTask(listMastery(profile.id)),
        runTask(listAttempts(profile.id)),
      ]);
      if (!active) return;
      if (masteryResult._tag === "Left" || attemptsResult._tag === "Left") {
        setFailed(true);
        return;
      }
      setReport(
        buildReport({
          mastery: masteryResult.right,
          attempts: attemptsResult.right,
          kindByItemId: KIND_BY_ITEM,
          totalByKind: TOTAL_BY_KIND,
        }),
      );
    })();

    return () => {
      active = false;
    };
  }, [profile.id]);

  const header = (
    <header className="parent__top">
      <button type="button" className="back-pill" onClick={onBack}>
        <Icon glyph={ArrowLeft} size={16} />
        <span>{t("common.back")}</span>
      </button>
      <h1 className="parent__title">{t("parent.report")}</h1>
    </header>
  );

  if (failed) {
    return (
      <div className="parent">
        {header}
        <section className="parent-card">
          <p role="alert">{t("error.storage")}</p>
        </section>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="parent">
        {header}
        <section className="parent-card">
          <p>{t("common.loading")}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="parent">
      {header}

      <section className="parent-card">
        <h2 className="parent-card__heading">{t("parent.summary")}</h2>
        <div className="report-grid">
          <div className="report-stat">
            <span className="report-stat__icon report-stat__icon--coral" aria-hidden="true">
              <Icon glyph={Target} size={17} />
            </span>
            <span className="report-stat__copy">
              <span className="report-stat__value">
                {report.mastered}/{report.totalItems}
              </span>
              <span className="report-stat__label">{t("parent.statMastered")}</span>
            </span>
          </div>
          <div className="report-stat">
            <span className="report-stat__icon report-stat__icon--sky" aria-hidden="true">
              <Icon glyph={RefreshCw} size={16} />
            </span>
            <span className="report-stat__copy">
              <span className="report-stat__value">{report.attempted}</span>
              <span className="report-stat__label">{t("parent.statAttempted")}</span>
            </span>
          </div>
          <div className="report-stat">
            <span className="report-stat__icon report-stat__icon--mango" aria-hidden="true">
              <Icon glyph={Star} size={16} />
            </span>
            <span className="report-stat__copy">
              <span className="report-stat__value">{report.stars}</span>
              <span className="report-stat__label">{t("parent.statStars")}</span>
            </span>
          </div>
          <div className="report-stat">
            <span className="report-stat__icon report-stat__icon--grape" aria-hidden="true">
              <Icon glyph={Zap} size={16} />
            </span>
            <span className="report-stat__copy">
              <span className="report-stat__value">{report.totalAttempts}</span>
              <span className="report-stat__label">{t("parent.statAttempts")}</span>
            </span>
          </div>
        </div>
        <p className="parent-card__note">
          {report.lastPlayedAt === null
            ? t("parent.neverPlayed")
            : t("parent.lastPlayed", {
                date: formatDate(report.lastPlayedAt, i18n.language),
              })}
        </p>
      </section>

      <section className="parent-card">
        <h2 className="parent-card__heading">{t("parent.levels")}</h2>
        <ul className="report__levels">
          {LEVELS.map((level) => (
            <li key={level} className="report__level">
              <span className={`report__dot report__dot--${level}`} />
              <span className="report__level-name">{t(`mastery.${level}`)}</span>
              <span className="report__level-count">
                {report.levelCounts[level]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="parent-card">
        <h2 className="parent-card__heading">{t("parent.byCategory")}</h2>
        <ul className="report__levels">
          {report.byKind.map((row) => (
            <li key={row.kind} className="report__bar">
              <span className="report__bar-name">
                {t(categoryLabelKey(row.kind))}
              </span>
              <span className="report__bar-track">
                <span
                  className="report__bar-fill"
                  style={{ width: `${percent(row.mastered, row.total)}%` }}
                />
              </span>
              <span className="report__bar-count">
                {row.mastered}/{row.total}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="parent-card">
        <h2 className="parent-card__heading">{t("parent.needsPractice")}</h2>
        {report.weakest.length === 0 ? (
          <p className="parent-card__note">{t("parent.noWeak")}</p>
        ) : (
          <ul className="report__items">
            {report.weakest.map((item) => (
              <li key={item.itemId} className="report__item">
                <span className="report__glyph">
                  {findGlyphItem(item.itemId)?.glyph ?? "?"}
                </span>
                <span className="report__item-meta">
                  <span className="report__item-name">
                    {item.kind ? t(categoryLabelKey(item.kind)) : ""}
                  </span>
                  <span className="report__item-sub">
                    {t("parent.practiceDetail", {
                      score: Math.round(item.score * 100),
                      attempts: item.attempts,
                    })}
                  </span>
                </span>
                <span className="report__stars" aria-hidden="true">
                  {"★".repeat(item.stars)}
                  {"☆".repeat(3 - item.stars)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="parent-card">
        <h2 className="parent-card__heading">{t("parent.tracingQuality")}</h2>
        {report.averageAccuracy === null ? (
          <p className="parent-card__note">{t("parent.noTracing")}</p>
        ) : (
          <ul className="report__levels">
            <li className="report__level">
              <span className="report__level-name">
                {t("parent.avgAccuracy")}
              </span>
              <span className="report__level-count">
                {Math.round(report.averageAccuracy * 100)}%
              </span>
            </li>
            <li className="report__level">
              <span className="report__level-name">{t("parent.traces")}</span>
              <span className="report__level-count">
                {report.traceAttempts}
              </span>
            </li>
          </ul>
        )}
      </section>
    </div>
  );
}
