import * as TE from "fp-ts/TaskEither";
import {
  updateMastery,
  type MasteryScore,
  type ModuleItemId,
  type ProfileId,
} from "../domain";
import { db } from "./db";
import { storageError, type StorageError } from "./errors";

export const listMastery = (
  profileId: string,
): TE.TaskEither<StorageError, MasteryScore[]> =>
  TE.tryCatch(
    () => db.mastery.where("profileId").equals(profileId).toArray(),
    storageError,
  );

export const getMastery = (
  profileId: ProfileId,
  itemId: ModuleItemId,
): TE.TaskEither<StorageError, MasteryScore | undefined> =>
  TE.tryCatch(() => db.mastery.get([profileId, itemId]), storageError);

export const recordAttempt = (
  profileId: ProfileId,
  itemId: ModuleItemId,
  accuracy: number,
  now: number,
): TE.TaskEither<StorageError, MasteryScore> =>
  TE.tryCatch(async () => {
    const previous = await db.mastery.get([profileId, itemId]);
    const next = updateMastery(previous, profileId, itemId, accuracy, now);
    await db.mastery.put(next);
    return next;
  }, storageError);
