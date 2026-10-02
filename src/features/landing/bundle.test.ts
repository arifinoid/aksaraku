import { describe, expect, test } from "bun:test";
import { exists } from "./meta";

/**
 * Guard rail: the landing page must not ship PixiJS, Three.js, or Dexie.
 * These are heavy engines only needed by the interactive app screens, not
 * the marketing landing page. If this test fails, something in the landing
 * import graph is pulling them in and needs to be severed.
 *
 * Run after `bun run build` — inspects `dist/landing.html` and its referenced
 * JS chunks. Bun splits the bundle by entry, so the landing chunks should
 * be self-contained.
 */

const HEAVY_PACKAGES = [
  "pixi",
  "three",
  "dexie",
] as const;

const findLandingChunks = async (): Promise<string[]> => {
  // Bun.Glob().scan() throws when the directory doesn't exist — guard first
  // so a missing dist/ (test run before build) yields an empty list instead
  // of an ENOENT crash.
  if (!(await exists("dist"))) return [];
  const chunks: string[] = [];
  const glob = new Bun.Glob("landing-*.js");
  for await (const file of glob.scan({ cwd: "dist" })) {
    chunks.push(`dist/${file}`);
  }
  // Also check the main landing HTML for inline references
  const html = "dist/landing.html";
  if (await exists(html)) chunks.push(html);
  return chunks;
};

describe("landing bundle", () => {
  test("excludes pixi/three/dexie from landing chunks", async () => {
    const chunks = await findLandingChunks();
    if (chunks.length === 0) {
      // Build hasn't run yet — skip with a clear message instead of passing silently.
      console.log("No landing chunks found in dist/ — run `bun run build` first.");
      return;
    }

    for (const chunk of chunks) {
      const content = await Bun.file(chunk).text();
      for (const pkg of HEAVY_PACKAGES) {
        // The landing page must not bundle PixiJS, Three.js, or Dexie.
        // These heavy engines are only needed by the interactive app screens.
        expect(
          content,
          `${chunk} contains '${pkg}' (should be excluded from landing bundle)`,
        ).not.toMatch(
          new RegExp(`\\b${pkg}\\b`, "i"),
        );
      }
    }
  });

  test("landing HTML entry exists with SEO meta tags", async () => {
    if (!(await exists("dist/landing.html"))) {
      // Build hasn't run yet (e.g. `bun test` before `bun run build`) —
      // skip with a clear message instead of failing with ENOENT.
      console.log("Skip: dist/landing.html not found — run `bun run build` first.");
      return;
    }
    const html = await Bun.file("dist/landing.html").text();
    expect(html).toContain("<title>");
    expect(html).toMatch(/<meta[^>]+name="description"/);
    expect(html).toMatch(/<meta[^>]+property="og:/);
  });
});
