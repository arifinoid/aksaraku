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
