import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  bankSession,
  defaultScreenTime,
  markBreak,
  restartSession,
  resumeSession,
  startSession,
  touchSession,
  updateBreakReminder,
  updateSessionLimit,
  type PlaySession,
  type ProfileId,
  type ScreenTimeSetting,
} from "../domain";
import { runTask } from "../platform/task";
import {
  loadScreenTime,
  loadSession,
  saveScreenTime,
  saveSession,
} from "../storage";

export interface SessionValue {
  readonly ready: boolean;
  readonly session: PlaySession | null;
  readonly startedAt: number;
  readonly lastBreakAt: number | null;
  readonly limitMin: number;
  readonly breakReminderMin: number;
  readonly restart: () => void;
  readonly takeBreak: () => void;
  readonly setLimitMin: (minutes: number) => void;
  readonly setBreakReminderMin: (minutes: number) => void;
}

const SessionContext = createContext<SessionValue | null>(null);

/**
 * How often the app records that it is still being used.
 *
 * This anchors the screen-time accounting: the time between two heartbeats
 * is charged even if the app is killed in between.
 */
const HEARTBEAT_MS = 30_000;

export interface SessionProviderProps {
  readonly profileId: ProfileId;
  readonly children: ReactNode;
}

export function SessionProvider({ profileId, children }: SessionProviderProps) {
  const [session, setSession] = useState<PlaySession | null>(null);
  const [setting, setSetting] = useState<ScreenTimeSetting>(() =>
    defaultScreenTime(profileId),
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const now = Date.now();
      const [settingResult, sessionResult] = await Promise.all([
        runTask(loadScreenTime(profileId)),
        runTask(loadSession(profileId)),
      ]);
      if (!active) return;

      // A storage failure must not leave the child without a screen-time
      // limit, and it must not block the app from loading either. Fall back
      // to the default limit and a fresh session, and carry on.
      const setting =
        settingResult._tag === "Right"
          ? settingResult.right
          : defaultScreenTime(profileId);
      const stored =
        sessionResult._tag === "Right" ? sessionResult.right : undefined;
      const next =
        stored === undefined
          ? startSession(profileId, now)
          : resumeSession(stored, now);

      setSetting(setting);
      setSession(next);
      setReady(true);
      void runTask(saveSession(next));
    })();

    return () => {
      active = false;
    };
  }, [profileId]);

  /**
   * Ends the foreground stretch when the app is hidden and starts a new one
   * when it comes back.
   *
   * Without this, closing the app and reopening it would hand the child a
   * fresh allowance — the time in between simply vanished. Banking keeps the
   * budget intact across reloads, which is what makes the parental limit
   * actually enforceable.
   */
  useEffect(() => {
    if (!ready) return;

    const onVisibilityChange = () => {
      const now = Date.now();
      setSession((current) => {
        if (!current) return current;
        const next =
          document.visibilityState === "hidden"
            ? bankSession(current, now)
            : resumeSession(current, now);
        void runTask(saveSession(next));
        return next;
      });
    };

    const onPageHide = () => {
      setSession((current) => {
        if (!current) return current;
        const next = bankSession(current, Date.now());
        void runTask(saveSession(next));
        return next;
      });
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [ready]);

  /**
   * Records that the app is still in use.
   *
   * `lastSeenAt` is the anchor for charging screen time, so it has to track
   * reality while the child is playing. Without this heartbeat a reload
   * would discard the time played since the session was loaded.
   */
  useEffect(() => {
    if (!ready) return;

    const id = setInterval(() => {
      if (document.visibilityState === "hidden") return;
      setSession((current) => {
        if (!current) return current;
        const next = touchSession(current, Date.now());
        void runTask(saveSession(next));
        return next;
      });
    }, HEARTBEAT_MS);

    return () => clearInterval(id);
  }, [ready]);

  const restart = useCallback(() => {
    setSession((current) => {
      if (!current) return current;
      const next = restartSession(current, Date.now());
      void runTask(saveSession(next));
      return next;
    });
  }, []);

  const takeBreak = useCallback(() => {
    setSession((current) => {
      if (!current) return current;
      const next = markBreak(current, Date.now());
      void runTask(saveSession(next));
      return next;
    });
  }, []);

  const persistSetting = useCallback((next: ScreenTimeSetting) => {
    setSetting(next);
    void runTask(saveScreenTime(next));
  }, []);

  const setLimitMin = useCallback(
    (minutes: number) => {
      const result = updateSessionLimit(setting, minutes);
      if (result._tag === "Left") return;
      persistSetting(result.right);
    },
    [setting, persistSetting],
  );

  const setBreakReminderMin = useCallback(
    (minutes: number) => {
      const result = updateBreakReminder(setting, minutes);
      if (result._tag === "Left") return;
      persistSetting(result.right);
    },
    [setting, persistSetting],
  );

  const value = useMemo<SessionValue>(
    () => ({
      ready,
      session,
      startedAt: session?.startedAt ?? Date.now(),
      lastBreakAt: session?.lastBreakAt ?? null,
      limitMin: setting.sessionLimitMin,
      breakReminderMin: setting.breakReminderMin,
      restart,
      takeBreak,
      setLimitMin,
      setBreakReminderMin,
    }),
    [
      ready,
      session,
      session?.startedAt,
      session?.lastBreakAt,
      setting.sessionLimitMin,
      setting.breakReminderMin,
      restart,
      takeBreak,
      setLimitMin,
      setBreakReminderMin,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export const useSession = (): SessionValue => {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return value;
};
