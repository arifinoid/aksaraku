export const exists = async (path: string): Promise<boolean> =>
  await Bun.file(path).exists();
