import * as TE from "fp-ts/TaskEither";
import type { TraceAttempt } from "../domain";
import { db } from "./db";
import { storageError, type StorageError } from "./errors";

export const saveAttempt = (
  attempt: TraceAttempt,
): TE.TaskEither<StorageError, TraceAttempt> =>
  TE.tryCatch(
    () => db.attempts.put(attempt).then(() => attempt),
    storageError,
  );

export const listAttempts = (
  profileId: string,
): TE.TaskEither<StorageError, TraceAttempt[]> =>
  TE.tryCatch(
    () => db.attempts.where("profileId").equals(profileId).toArray(),
    storageError,
  );

export const latestAttemptsByItem = (
  profileId: string,
): TE.TaskEither<StorageError, readonly TraceAttempt[]> =>
  TE.tryCatch(async () => {
    const attempts = await db.attempts
      .where("profileId")
      .equals(profileId)
      .toArray();
    return attempts.sort((a, b) => b.completedAt - a.completedAt);
  }, storageError);
