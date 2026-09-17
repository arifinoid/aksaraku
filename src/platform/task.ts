import type * as E from "fp-ts/Either";
import type * as TE from "fp-ts/TaskEither";

export const runTask = <Err, A>(
  task: TE.TaskEither<Err, A>,
): Promise<E.Either<Err, A>> => task();
