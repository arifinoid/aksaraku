import * as TE from "fp-ts/TaskEither";
import {
  defaultScreenTime,
  type ProfileId,
  type ScreenTimeSetting,
} from "../domain";
import { db } from "./db";
import { storageError, type StorageError } from "./errors";

export const loadScreenTime = (
  profileId: ProfileId,
): TE.TaskEither<StorageError, ScreenTimeSetting> =>
  TE.tryCatch(async () => {
    const row = await db.screenTime.get(profileId);
    return row ?? defaultScreenTime(profileId);
  }, storageError);

export const saveScreenTime = (
  setting: ScreenTimeSetting,
): TE.TaskEither<StorageError, ScreenTimeSetting> =>
  TE.tryCatch(
    () => db.screenTime.put(setting).then(() => setting),
    storageError,
  );
