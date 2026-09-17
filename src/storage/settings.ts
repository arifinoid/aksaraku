import * as TE from "fp-ts/TaskEither";
import {
  defaultSettings,
  isLocale,
  type AppSettings,
} from "../domain";
import { db } from "./db";
import { storageError, type StorageError } from "./errors";

const SETTINGS_KEY = "app";

const readBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === "boolean" ? value : fallback;

export const loadSettings = (): TE.TaskEither<StorageError, AppSettings> =>
  TE.tryCatch(async () => {
    const row = await db.settings.get(SETTINGS_KEY);
    const stored = (row?.value ?? {}) as Partial<AppSettings>;
    return {
      locale:
        typeof stored.locale === "string" && isLocale(stored.locale)
          ? stored.locale
          : defaultSettings.locale,
      hapticsEnabled: readBoolean(
        stored.hapticsEnabled,
        defaultSettings.hapticsEnabled,
      ),
      audioEnabled: readBoolean(stored.audioEnabled, defaultSettings.audioEnabled),
    };
  }, storageError);

export const saveSettings = (
  settings: AppSettings,
): TE.TaskEither<StorageError, AppSettings> =>
  TE.tryCatch(
    () =>
      db.settings
        .put({ key: SETTINGS_KEY, value: settings })
        .then(() => settings),
    storageError,
  );
