export const shuffle = <T>(
  list: readonly T[],
  random: () => number,
): readonly T[] => {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.min(i, Math.floor(random() * (i + 1)));
    const a = result[i];
    const b = result[j];
    if (a === undefined || b === undefined) continue;
    result[i] = b;
    result[j] = a;
  }
  return result;
};

export const sample = <T>(
  list: readonly T[],
  count: number,
  random: () => number,
): readonly T[] => {
  const size = Math.max(0, Math.min(Math.floor(count), list.length));
  return shuffle(list, random).slice(0, size);
};

export const pickOne = <T>(
  list: readonly T[],
  random: () => number,
): T | undefined => {
  if (list.length === 0) return undefined;
  const index = Math.min(list.length - 1, Math.floor(random() * list.length));
  return list[index];
};
