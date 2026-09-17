import * as TE from "fp-ts/TaskEither";
import type { AvatarConfig, ProfileId } from "../domain";
import { db } from "./db";
import { storageError, type StorageError } from "./errors";

export const loadAvatar = (
  profileId: string,
): TE.TaskEither<StorageError, AvatarConfig | undefined> =>
  TE.tryCatch(
    async () => (await db.avatars.get(profileId))?.config,
    storageError,
  );

export const saveAvatar = (
  profileId: ProfileId,
  config: AvatarConfig,
): TE.TaskEither<StorageError, AvatarConfig> =>
  TE.tryCatch(async () => {
    await db.avatars.put({ profileId, config });
    return config;
  }, storageError);
