import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  defaultScreenTime,
  markBreak,
  restartSession,
  resumeSession,
  startSession,
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
      if (settingResult._tag === "Left" || sessionResult._tag === "Left") {
        return;
      }

      const stored = sessionResult.right;
      const next =
        stored === undefined
          ? startSession(profileId, now)
          : resumeSession(stored, now);

      setSetting(settingResult.right);
      setSession(next);
      setReady(true);
      void runTask(saveSession(next));
    })();

    return () => {
      active = false;
    };
  }, [profileId]);

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
