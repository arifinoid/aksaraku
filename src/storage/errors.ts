export type StorageError = {
  readonly _tag: "StorageError";
  readonly message: string;
};

export const storageError = (cause: unknown): StorageError => ({
  _tag: "StorageError",
  message: cause instanceof Error ? cause.message : String(cause),
});
