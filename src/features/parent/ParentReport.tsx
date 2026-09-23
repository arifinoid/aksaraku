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
import { Button, Screen } from "../../ui";
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

  if (failed) {
    return (
      <Screen title={t("parent.report")} onBack={onBack}>
        <p role="alert">{t("error.storage")}</p>
      </Screen>
    );
  }

  if (!report) {
    return (
      <Screen title={t("parent.report")} onBack={onBack}>
        <p>{t("common.loading")}</p>
      </Screen>
    );
  }

  return (
    <Screen title={t("parent.report")} onBack={onBack}>
      <section className="panel">
        <h2 className="panel__title">{t("parent.summary")}</h2>
        <div className="report__grid">
          <div className="report__stat">
            <span className="report__value">
              {report.mastered}/{report.totalItems}
            </span>
            <span className="report__label">{t("parent.statMastered")}</span>
          </div>
          <div className="report__stat">
            <span className="report__value">{report.attempted}</span>
            <span className="report__label">{t("parent.statAttempted")}</span>
          </div>
          <div className="report__stat">
            <span className="report__value">⭐ {report.stars}</span>
            <span className="report__label">{t("parent.statStars")}</span>
          </div>
          <div className="report__stat">
            <span className="report__value">{report.totalAttempts}</span>
            <span className="report__label">{t("parent.statAttempts")}</span>
          </div>
        </div>
        <p className="panel__hint">
          {report.lastPlayedAt === null
            ? t("parent.neverPlayed")
            : t("parent.lastPlayed", {
                date: formatDate(report.lastPlayedAt, i18n.language),
              })}
        </p>
      </section>

      <section className="panel">
        <h2 className="panel__title">{t("parent.levels")}</h2>
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

      <section className="panel">
        <h2 className="panel__title">{t("parent.byCategory")}</h2>
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

      <section className="panel">
        <h2 className="panel__title">{t("parent.needsPractice")}</h2>
        {report.weakest.length === 0 ? (
          <p className="panel__hint">{t("parent.noWeak")}</p>
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
                <span className="report__stars">
                  {"★".repeat(item.stars)}
                  {"☆".repeat(3 - item.stars)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2 className="panel__title">{t("parent.tracingQuality")}</h2>
        {report.averageAccuracy === null ? (
          <p className="panel__hint">{t("parent.noTracing")}</p>
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

      <Button label={t("common.back")} variant="ghost" onClick={onBack} />
    </Screen>
  );
}
