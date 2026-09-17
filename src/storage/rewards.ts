import * as TE from "fp-ts/TaskEither";
import type { Reward } from "../domain";
import { db } from "./db";
import { storageError, type StorageError } from "./errors";

export const listRewards = (
  profileId: string,
): TE.TaskEither<StorageError, Reward[]> =>
  TE.tryCatch(
    () => db.profileRewards.where("profileId").equals(profileId).toArray(),
    storageError,
  );

export const saveRewards = (
  rewards: readonly Reward[],
): TE.TaskEither<StorageError, readonly Reward[]> =>
  TE.tryCatch(async () => {
    await db.profileRewards.bulkPut([...rewards]);
    return rewards;
  }, storageError);
