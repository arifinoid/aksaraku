import * as TE from "fp-ts/TaskEither";
import type { Profile } from "../domain";
import { db } from "./db";
import { storageError, type StorageError } from "./errors";

export const listProfiles = (): TE.TaskEither<StorageError, Profile[]> =>
  TE.tryCatch(() => db.profiles.orderBy("createdAt").toArray(), storageError);

export const getProfile = (
  id: string,
): TE.TaskEither<StorageError, Profile | undefined> =>
  TE.tryCatch(() => db.profiles.get(id), storageError);

export const saveProfile = (
  profile: Profile,
): TE.TaskEither<StorageError, Profile> =>
  TE.tryCatch(
    () => db.profiles.put(profile).then(() => profile),
    storageError,
  );

export const deleteProfile = (
  id: string,
): TE.TaskEither<StorageError, void> =>
  TE.tryCatch(() => db.profiles.delete(id), storageError);

/** Removes the profile together with everything recorded for it. */
export const deleteProfileCascade = (
  id: string,
): TE.TaskEither<StorageError, void> =>
  TE.tryCatch(
    () =>
      db.transaction(
        "rw",
        [
          db.profiles,
          db.attempts,
          db.mastery,
          db.profileRewards,
          db.avatars,
          db.sessions,
          db.screenTime,
        ],
        async () => {
          await db.profiles.delete(id);
          await db.attempts.where("profileId").equals(id).delete();
          await db.mastery.where("profileId").equals(id).delete();
          await db.profileRewards.where("profileId").equals(id).delete();
          await db.avatars.delete(id);
          await db.sessions.delete(id);
          await db.screenTime.delete(id);
        },
      ),
    storageError,
  );
