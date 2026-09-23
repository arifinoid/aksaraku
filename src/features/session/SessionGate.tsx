import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "../../app/SessionContext";
import { isBreakDueSince, isExpiredSince } from "../../domain";
import { ParentGate } from "../parent/ParentGate";
import "./session.css";

const TICK_MS = 10_000;

export interface SessionGateProps {
  readonly children: ReactNode;
}

export function SessionGate({ children }: SessionGateProps) {
  const { t } = useTranslation();
  const {
    ready,
    startedAt,
    lastBreakAt,
    limitMin,
    breakReminderMin,
    restart,
    takeBreak,
  } = useSession();
  const [now, setNow] = useState(() => Date.now());
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, TICK_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  if (!ready) {
    return <>{children}</>;
  }

  const expired = isExpiredSince(startedAt, limitMin, now);
  const breakDue = isBreakDueSince(
    startedAt,
    breakReminderMin,
    lastBreakAt,
    now,
  );

  if (expired) {
    return (
      <div className="session-lock" role="dialog" aria-modal="true">
        <div className="session-lock__card panel">
          <p className="session-lock__emoji" aria-hidden="true">
            🌙
          </p>
          <h1 className="session-lock__title">{t("session.expiredTitle")}</h1>
          <p className="panel__hint">{t("session.expiredHint")}</p>

          {unlocking ? (
            <ParentGate
              onUnlock={() => {
                setUnlocking(false);
                restart();
              }}
              onCancel={() => setUnlocking(false)}
            />
          ) : (
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={() => setUnlocking(true)}
            >
              <span className="btn__label">{t("session.parentUnlock")}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {breakDue ? (
        <div className="session-break" role="status">
          <span className="session-break__text">
            {t("session.breakReminder", { minutes: breakReminderMin })}
          </span>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={takeBreak}
          >
            <span className="btn__label">{t("session.breakDone")}</span>
          </button>
        </div>
      ) : null}
      {children}
    </>
  );
}
