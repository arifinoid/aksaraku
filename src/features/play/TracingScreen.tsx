import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  scoreSession,
  type AppSettings,
  type ModuleItem,
  type Profile,
  type TraceEvent,
  type TraceScore,
  type TraceSession,
} from "../../domain";
import { TracingCanvas } from "../../game";
import { newId } from "../../platform/ids";
import { runTask } from "../../platform/task";
import { recordAttempt, saveAttempt } from "../../storage";
import { Button, Screen } from "../../ui";
import "./play.css";

export interface TracingScreenProps {
  readonly item: ModuleItem;
  readonly profile: Profile;
  readonly settings: AppSettings;
  readonly onBack: () => void;
  readonly onNext: () => void;
}

export function TracingScreen({
  item,
  profile,
  settings,
  onBack,
  onNext,
}: TracingScreenProps) {
  const { t } = useTranslation();
  const [coverage, setCoverage] = useState(0);
  const [strokeIndex, setStrokeIndex] = useState(0);
  const [score, setScore] = useState<TraceScore | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [offTrack, setOffTrack] = useState(false);

  const totalStrokes = item.strokes.length;

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
          void runTask(recordAttempt(profile.id, item.id, result.accuracy, now));
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
    [item.id, profile.id, totalStrokes],
  );

  const retry = useCallback(() => {
    setScore(null);
    setCoverage(0);
    setStrokeIndex(0);
    setOffTrack(false);
    setResetKey((value) => value + 1);
  }, []);

  const currentLine = Math.min(strokeIndex + 1, totalStrokes);

  return (
    <Screen title={item.glyph} onBack={onBack}>
      <TracingCanvas
        item={item}
        resetKey={resetKey}
        audioEnabled={settings.audioEnabled}
        hapticsEnabled={settings.hapticsEnabled}
        onEvent={handleEvent}
        onCoverage={setCoverage}
      />

      <div className="play__progress">
        <div
          className="play__progress-fill"
          style={{ width: `${Math.round(coverage * 100)}%` }}
        />
      </div>

      <p className={`play__hint${offTrack ? " play__hint--warn" : ""}`}>
        {offTrack
          ? t("play.offTrack")
          : t("play.strokeProgress", { current: currentLine, total: totalStrokes })}
      </p>

      {score ? (
        <div className="play__overlay">
          <p className="play__stars">
            {"⭐".repeat(score.stars) || "💪"}
          </p>
          <h2 className="play__overlay-title">{t("play.great")}</h2>
          <div className="play__overlay-actions">
            <Button
              label={t("play.retry")}
              variant="secondary"
              icon="🔁"
              onClick={retry}
            />
            <Button label={t("play.next")} icon="➡️" onClick={onNext} />
          </div>
        </div>
      ) : null}
    </Screen>
  );
}
