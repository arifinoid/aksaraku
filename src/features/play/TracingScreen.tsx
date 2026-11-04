import {
  ArrowRight,
  Check,
  ChevronLeft,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Star,
  Volume2,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRewards } from "../../app/RewardsContext";
import {
  avatarEmoji,
  categoryLabelKey,
  itemPhoneme,
  objectEntry,
} from "../../data";
import {
  masteryLevel,
  scoreSession,
  type AppSettings,
  type ModuleItem,
  type Profile,
  type TraceEvent,
  type TraceScore,
  type TraceSession,
} from "../../domain";
import { TracingCanvas } from "../../game";
import { useActiveLocale } from "../../i18n";
import { newId } from "../../platform/ids";
import { speakPhoneme } from "../../platform/speech";
import { runTask } from "../../platform/task";
import { recordAttempt, saveAttempt } from "../../storage";
import { Icon, StarRow } from "../../ui";
import "./play.css";

export interface TracingScreenProps {
  readonly item: ModuleItem;
  readonly profile: Profile;
  readonly settings: AppSettings;
  /** Every glyph of the current category, so the child can jump around. */
  readonly siblings: readonly ModuleItem[];
  readonly onBack: () => void;
  readonly onSelect: (id: string) => void;
  readonly onNext: () => void;
  readonly onColor: () => void;
}

type Tone = "coral" | "grape" | "mango";

const TONE_BY_TITLE: Readonly<Record<string, Tone>> = {
  digit: "grape",
  shape: "mango",
};

export function TracingScreen({
  item,
  profile,
  settings,
  siblings,
  onBack,
  onSelect,
  onNext,
  onColor,
}: TracingScreenProps) {
  const { t } = useTranslation();
  const locale = useActiveLocale();
  const { mastery, refresh } = useRewards();
  const [coverage, setCoverage] = useState(0);
  const [strokeIndex, setStrokeIndex] = useState(0);
  const [score, setScore] = useState<TraceScore | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [offTrack, setOffTrack] = useState(false);

  const totalStrokes = item.strokes.length;
  const isDigit = item.kind === "digit";
  const isShape = item.kind === "shape";

  const index = siblings.findIndex((entry) => entry.id === item.id);
  const position = index + 1;
  const nextItem = siblings[(index + 1) % siblings.length] ?? item;

  const shapeNameOf = useCallback(
    (entry: ModuleItem) => t(`play.shape.${entry.id.slice("shape-".length)}`),
    [t],
  );

  const shapeName = isShape ? shapeNameOf(item) : "";
  const object = objectEntry(item.glyph);
  const objectName = object ? (object.names[locale] ?? object.names.id) : undefined;

  const title = isDigit
    ? t("play.digitTitle", { glyph: item.glyph })
    : isShape
      ? t("play.shapeTitle")
      : t("play.letterTitle", { glyph: item.glyph });

  const strokeText = t("play.strokeProgress", {
    current: Math.min(strokeIndex + 1, totalStrokes),
    total: totalStrokes,
  });

  const subtitle = isDigit
    ? t("play.digitSub")
    : isShape
      ? t("play.shapeSub", { current: position, total: siblings.length })
      : objectName
        ? `${t("play.objectHint", { glyph: item.glyph, object: objectName })} · ${strokeText}`
        : strokeText;

  const canvasLabel = `${t(categoryLabelKey(item.kind))} · ${
    isShape ? shapeName : item.glyph
  }`;

  const masteredCount = siblings.filter((entry) => {
    const record = mastery.find((row) => row.itemId === entry.id);
    return (
      record !== undefined && masteryLevel(record.score, record.attempts) === "mastered"
    );
  }).length;

  const tone: Tone = isDigit ? "grape" : isShape ? "mango" : "coral";
  const tip = offTrack
    ? t("play.offTrack")
    : isDigit
      ? t("play.tipDigit")
      : isShape
        ? t("play.tipShape")
        : t("play.tipLetter");

  const primaryLabel = isDigit
    ? t("play.nextDigit", { glyph: nextItem.glyph })
    : t("play.finish");

  const handleEvent = useCallback(
    (event: TraceEvent, session: TraceSession) => {
      switch (event._tag) {
        case "ItemCompleted": {
          const now = Date.now();
          const result = scoreSession(session, now);
          setScore(result);
          setStrokeIndex(totalStrokes);
          setOffTrack(false);
          void runTask(
            saveAttempt({
              id: newId(),
              profileId: profile.id,
              itemId: item.id,
              accuracy: result.accuracy,
              deviationAvg: result.deviationAvg,
              durationMs: result.durationMs,
              completedAt: now,
            }),
          );
          void (async () => {
            await runTask(
              recordAttempt(profile.id, item.id, result.accuracy, now),
            );
            await refresh();
          })();
          window.setTimeout(
            () =>
              speakPhoneme(
                itemPhoneme(item, locale),
                locale,
                settings.audioEnabled,
              ),
            650,
          );
          break;
        }
        case "StrokeCompleted":
          setStrokeIndex((value) => value + 1);
          setOffTrack(false);
          break;
        case "OffTrack":
          setOffTrack(true);
          break;
        case "Progress":
        case "Ignored":
          break;
      }
    },
    [
      item,
      locale,
      profile.id,
      refresh,
      settings.audioEnabled,
      totalStrokes,
    ],
  );

  const retry = useCallback(() => {
    setScore(null);
    setCoverage(0);
    setStrokeIndex(0);
    setOffTrack(false);
    setResetKey((value) => value + 1);
  }, []);

  const listen = () =>
    speakPhoneme(itemPhoneme(item, locale), locale, settings.audioEnabled);

  const nextLabel = isDigit
    ? t("play.nextDigit", { glyph: nextItem.glyph })
    : isShape
      ? t("play.nextShape", { name: shapeNameOf(nextItem) })
      : t("play.nextGlyph", { glyph: nextItem.glyph });

  const retryLabel = isDigit
    ? t("play.retry")
    : isShape
      ? t("play.retryShape", { name: shapeName })
      : t("play.retryGlyph", { glyph: item.glyph });

  const colorLabel = isDigit
    ? t("play.color")
    : isShape
      ? t("play.color")
      : t("play.colorGlyph", { glyph: item.glyph });

  return (
    <div className={`trace trace--${TONE_BY_TITLE[item.kind] ?? "coral"}`}>
      <header className="trace__top">
        <button type="button" className="trace__back" onClick={onBack}>
          <Icon glyph={ChevronLeft} size={16} />
          <span className="trace__back-label">{t("common.back")}</span>
        </button>

        <div className="trace__heading">
          <h1 className="trace__title">{title}</h1>
          <p className="trace__sub">{subtitle}</p>
        </div>

        <div className="trace__aside">
          {isDigit ? (
            <span className="trace__chip">
              {t("play.ratio", {
                current: position,
                total: siblings.length,
              })}
            </span>
          ) : isShape ? (
            <span className="trace__chip">
              <Icon glyph={Star} size={13} className="trace__chip-icon" />
              {t("play.ratio", {
                current: masteredCount,
                total: siblings.length,
              })}
            </span>
          ) : (
            <button type="button" className="trace__listen" onClick={listen}>
              <Icon glyph={Volume2} size={14} className="trace__listen-icon" />
              <span>{t("play.listen")}</span>
            </button>
          )}
        </div>
      </header>

      <div className="trace__body">
        {isDigit ? (
          <div className="trace__strip" role="tablist" aria-label={t("play.pick")}>
            {siblings.map((entry) => (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={entry.id === item.id}
                className={`trace__strip-item${
                  entry.id === item.id ? " is-active" : ""
                }`}
                onClick={() => onSelect(entry.id)}
              >
                {entry.glyph}
              </button>
            ))}
          </div>
        ) : null}

        {!isDigit && !isShape && objectName ? (
          <div className="trace-word">
            <span className="trace-word__badge" aria-hidden="true">
              {object?.emoji}
            </span>
            <span className="trace-word__text">
              {t("play.objectHint", { glyph: item.glyph, object: objectName })}
            </span>
            <button
              type="button"
              className="trace-word__listen"
              onClick={listen}
            >
              <Icon glyph={Volume2} size={14} />
              {t("play.listen")}
            </button>
          </div>
        ) : null}

        <div className="trace__stage">
          <div className="trace-card">
            <p className="trace-card__label">{canvasLabel}</p>
            <div className="trace-card__canvas">
              <TracingCanvas
                item={item}
                resetKey={resetKey}
                audioEnabled={settings.audioEnabled}
                hapticsEnabled={settings.hapticsEnabled}
                reduceMotion={settings.reduceMotion}
                label={t("play.canvasLabel", { glyph: item.glyph })}
                onEvent={handleEvent}
                onCoverage={setCoverage}
              />
            </div>
            <Icon
              glyph={Sparkles}
              size={12}
              className="trace-card__spark trace-card__spark--1"
            />
            <Icon
              glyph={Sparkles}
              size={10}
              className="trace-card__spark trace-card__spark--2"
            />
            <Icon
              glyph={Sparkles}
              size={11}
              className="trace-card__spark trace-card__spark--3"
            />
            <p className="trace-card__foot">{t("play.dragHint")}</p>
          </div>
        </div>

        {isShape ? (
          <div className="trace__shape-pick">
            <p className="trace__pick">{t("play.pickShape")}</p>
            <div className="trace__shapes">
              {siblings.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className={`shape-chip${
                    entry.id === item.id ? " is-active" : ""
                  }`}
                  aria-pressed={entry.id === item.id}
                  onClick={() => onSelect(entry.id)}
                >
                  <span className="shape-chip__glyph" aria-hidden="true">
                    {entry.glyph}
                  </span>
                  <span className="shape-chip__name">
                    {shapeNameOf(entry)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {!isDigit ? (
          <div className="trace-strokes">
            <div className="trace-strokes__bars" aria-hidden="true">
              {Array.from({ length: totalStrokes }, (_, step) => (
                <span
                  key={step}
                  className={`trace-strokes__bar${
                    step < strokeIndex ? " is-done" : ""
                  }`}
                />
              ))}
            </div>
            <p className="trace-strokes__label">{strokeText}</p>
          </div>
        ) : null}

        <div
          className={`trace-tip${offTrack ? " trace-tip--warn" : ""}`}
          aria-live="polite"
        >
          <span className="trace-tip__icon" aria-hidden="true">
            {isDigit ? (
              <Icon glyph={Lightbulb} size={16} />
            ) : isShape ? (
              <Icon glyph={Sparkles} size={16} />
            ) : (
              avatarEmoji(profile.avatarId)
            )}
          </span>
          <p className="trace-tip__text">{tip}</p>
        </div>

        <div className="trace-progress">
          <div className="trace-progress__head">
            <span>{t("play.progressTitle")}</span>
            <span className="trace-progress__value">
              {Math.round(coverage * 100)}%
            </span>
          </div>
          <div
            className="trace-progress__track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(coverage * 100)}
            aria-label={t("play.progressTitle")}
          >
            <span
              className="trace-progress__fill"
              style={{ width: `${Math.round(coverage * 100)}%` }}
            />
          </div>
        </div>

        <div className="trace__controls">
          <button
            type="button"
            className="trace__reset"
            onClick={retry}
            aria-label={retryLabel}
          >
            <Icon glyph={RotateCcw} size={20} />
          </button>
          <button
            type="button"
            className={`trace__done trace__done--${tone}`}
            onClick={isDigit ? onNext : onBack}
          >
            <span>{primaryLabel}</span>
            {isDigit ? (
              <Icon glyph={ArrowRight} size={18} />
            ) : (
              <Icon glyph={Check} size={18} />
            )}
          </button>
        </div>
      </div>

      {score ? (
        <div
          className="trace-done"
          role="dialog"
          aria-modal="true"
          aria-labelledby="trace-done-title"
        >
          <div className="trace-done__confetti" aria-hidden="true">
            {Array.from({ length: 10 }, (_, piece) => (
              <span
                key={piece}
                className={`trace-done__piece trace-done__piece--${piece % 5}`}
              />
            ))}
          </div>
          <span className="trace-done__avatar" aria-hidden="true">
            {avatarEmoji(profile.avatarId)}
          </span>
          <h2 className="trace-done__title" id="trace-done-title">
            {t("play.doneTitle", { name: profile.name })}
          </h2>
          <p className="trace-done__sub">
            {t("play.doneSub", { glyph: item.glyph })}
          </p>
          <StarRow stars={score.stars} />
          <div className="trace-done__chips">
            <span className="trace-done__chip">
              <Icon glyph={Star} size={14} className="trace-done__chip-icon" />
              {t("play.chipStars", { count: score.stars })}
            </span>
            <span className="trace-done__chip trace-done__chip--grape">
              <Icon
                glyph={Sparkles}
                size={14}
                className="trace-done__chip-icon"
              />
              {t("play.chipLines", { count: totalStrokes })}
            </span>
          </div>
          <button
            type="button"
            className="trace-done__primary"
            onClick={onNext}
          >
            {nextLabel}
            <Icon glyph={ArrowRight} size={18} />
          </button>
          <button type="button" className="trace-done__ghost" onClick={retry}>
            <Icon glyph={RotateCcw} size={14} />
            {retryLabel}
          </button>
          {item.kind === "letter-upper" || item.kind === "letter-lower" ? (
            <button
              type="button"
              className="trace-done__ghost"
              onClick={onColor}
            >
              <Icon glyph={Sparkles} size={14} />
              {colorLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
