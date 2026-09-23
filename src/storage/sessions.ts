import * as TE from "fp-ts/TaskEither";
import type { PlaySession, ProfileId } from "../domain";
import { db } from "./db";
import { storageError, type StorageError } from "./errors";

export const loadSession = (
  profileId: ProfileId,
): TE.TaskEither<StorageError, PlaySession | undefined> =>
  TE.tryCatch(() => db.sessions.get(profileId), storageError);

export const saveSession = (
  session: PlaySession,
): TE.TaskEither<StorageError, PlaySession> =>
  TE.tryCatch(
    () => db.sessions.put(session).then(() => session),
    storageError,
  );

export const clearSession = (
  profileId: ProfileId,
): TE.TaskEither<StorageError, void> =>
  TE.tryCatch(() => db.sessions.delete(profileId), storageError);
