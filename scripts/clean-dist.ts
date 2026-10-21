/**
 * Empties the build output directory.
 *
 * The bundler writes content-hashed filenames, so a rebuild leaves the
 * previous build's files behind. `scripts/build-sw.ts` precaches whatever
 * it finds in `dist/`, which means a stale chunk from an earlier build
 * would be shipped in the offline cache for ever, for a file no page
 * references any more.
 *
 * Usage: bun scripts/clean-dist.ts
 */
import { rm } from "node:fs/promises";

const DIST = "dist";

await rm(DIST, { recursive: true, force: true });
console.log(`✅ ${DIST} cleaned`);
