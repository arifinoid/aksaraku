import { existsSync } from "node:fs";

export const exists = async (path: string): Promise<boolean> => existsSync(path);
