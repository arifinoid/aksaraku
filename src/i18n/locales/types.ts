import type { id } from "./id";

type DeepStringify<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};

export type Dict = DeepStringify<typeof id>;
