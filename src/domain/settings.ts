import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { isLocale } from "./profile";
import type { AppSettings, Locale, ScreenTimeSetting } from "./types";

export const DEFAULT_LOCALE: Locale = "id";

export const defaultSettings: AppSettings = {
  locale: DEFAULT_LOCALE,
  hapticsEnabled: true,
  audioEnabled: true,
};

export const DEFAULT_SESSION_LIMIT_MIN = 15;
export const DEFAULT_BREAK_REMINDER_MIN = 5;
export const MIN_SESSION_LIMIT_MIN = 5;
export const MAX_SESSION_LIMIT_MIN = 60;
export const MIN_BREAK_REMINDER_MIN = 0;
export const MAX_BREAK_REMINDER_MIN = 60;

export const SESSION_LIMIT_OPTIONS: readonly number[] = [10, 15, 20, 30];
export const BREAK_REMINDER_OPTIONS: readonly number[] = [0, 3, 5, 10, 15];

export type SettingsError =
  | { readonly _tag: "InvalidLocale"; readonly locale: string }
  | { readonly _tag: "InvalidSessionLimit"; readonly minutes: number }
  | { readonly _tag: "InvalidBreakReminder"; readonly minutes: number };

export const settingsErrorMessageKey = (error: SettingsError): string => {
  switch (error._tag) {
    case "InvalidLocale":
      return "settings.errors.invalidLocale";
    case "InvalidSessionLimit":
      return "settings.errors.invalidSessionLimit";
    case "InvalidBreakReminder":
      return "settings.errors.invalidBreakReminder";
  }
};

export const setLocale = (
  settings: AppSettings,
  locale: string,
): E.Either<SettingsError, AppSettings> =>
  isLocale(locale)
    ? E.right({ ...settings, locale })
    : E.left({ _tag: "InvalidLocale", locale });

export const setHaptics = (
  settings: AppSettings,
  enabled: boolean,
): AppSettings => ({ ...settings, hapticsEnabled: enabled });

export const setAudio = (
  settings: AppSettings,
  enabled: boolean,
): AppSettings => ({ ...settings, audioEnabled: enabled });

export const validateSessionLimit = (
  minutes: number,
): E.Either<SettingsError, number> =>
  pipe(
    E.fromPredicate(
      (value: number) =>
        Number.isFinite(value) &&
        value >= MIN_SESSION_LIMIT_MIN &&
        value <= MAX_SESSION_LIMIT_MIN,
      (value: number): SettingsError => ({
        _tag: "InvalidSessionLimit",
        minutes: value,
      }),
    )(minutes),
    E.map((value) => Math.round(value)),
  );

export const defaultScreenTime = (
  profileId: ScreenTimeSetting["profileId"],
): ScreenTimeSetting => ({
  profileId,
  sessionLimitMin: DEFAULT_SESSION_LIMIT_MIN,
  breakReminderMin: DEFAULT_BREAK_REMINDER_MIN,
});

export const updateSessionLimit = (
  setting: ScreenTimeSetting,
  minutes: number,
): E.Either<SettingsError, ScreenTimeSetting> =>
  pipe(
    validateSessionLimit(minutes),
    E.map((valid) => ({ ...setting, sessionLimitMin: valid })),
  );

export const updateBreakReminder = (
  setting: ScreenTimeSetting,
  minutes: number,
): E.Either<SettingsError, ScreenTimeSetting> =>
  pipe(
    E.fromPredicate(
      (value: number) =>
        Number.isFinite(value) &&
        value >= MIN_BREAK_REMINDER_MIN &&
        value <= MAX_BREAK_REMINDER_MIN,
      (value: number): SettingsError => ({
        _tag: "InvalidBreakReminder",
        minutes: value,
      }),
    )(minutes),
    E.map((valid) => ({
      ...setting,
      breakReminderMin: Math.round(valid),
    })),
  );
