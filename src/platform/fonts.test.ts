import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const PUBLIC_FONTS = join(import.meta.dir, "..", "..", "public", "fonts");
const SRC = join(import.meta.dir, "..", "..", "src");
const SERVER = join(import.meta.dir, "..", "..", "src", "index.ts");

/** Every file under `src/`, so a stray `@font-face` can be spotted. */
const sourceFiles = (dir: string): readonly string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(css|ts|tsx|html)$/.test(entry.name) ? [path] : [];
  });

describe("self-hosted fonts", () => {
  test("ship the woff2 files the stylesheet references", () => {
    const css = readFileSync(join(PUBLIC_FONTS, "fonts.css"), "utf8");
    const referenced = [...css.matchAll(/url\("(\/fonts\/[^"]+)"\)/g)].map(
      (match) => match[1]!,
    );
    expect(referenced.length).toBeGreaterThan(0);

    for (const href of referenced) {
      const file = join(PUBLIC_FONTS, href.replace("/fonts/", ""));
      expect(`${href}: ${statSync(file).size}`).not.toMatch(/ENOENT/);
      expect(`${href}: ${statSync(file).size}`).not.toMatch(/0$/);
    }
  });

  test("use the woff2 format, which every target browser supports", () => {
    const css = readFileSync(join(PUBLIC_FONTS, "fonts.css"), "utf8");
    expect(css).toContain('format("woff2")');
    expect(css).not.toMatch(/format\("(truetype|opentype)"\)/);
  });

  test("declare a font-display so text is readable while loading", () => {
    const css = readFileSync(join(PUBLIC_FONTS, "fonts.css"), "utf8");
    const faces = css.match(/@font-face/g)?.length ?? 0;
    const swaps = css.match(/font-display: swap/g)?.length ?? 0;
    expect(`${swaps}/${faces}`).toBe(`${faces}/${faces}`);
  });

  test("stay out of the bundler, which would base64-inline them", () => {
    // Bun's CSS bundler inlines any font referenced from an `@font-face`
    // rule as a data URL. Keeping the rules in `public/` means the fonts
    // ship as separate, cacheable files instead of ~180 KB of base64 in
    // the critical-path stylesheet.
    const offenders = sourceFiles(SRC).filter((file) => {
      if (file.endsWith(".test.ts")) return false;
      const source = readFileSync(file, "utf8");
      // A real rule is `at-rule {`; a mention in a comment is not.
      if (/@font-face\s*\{/.test(source)) return true;
      // A static import would be resolved by the bundler. A runtime string
      // constant (as in `src/platform/fonts.ts`) is the escape hatch and
      // is allowed.
      return /^\s*import\s.*["'][^"']*fonts\.css["']/m.test(source);
    });
    expect(offenders.join(", ")).toBe("");
  });

  test("are reachable at the root-absolute path the stylesheet uses", () => {
    const css = readFileSync(join(PUBLIC_FONTS, "fonts.css"), "utf8");
    for (const match of css.matchAll(/url\("([^"]+)"\)/g)) {
      expect(match[1]!.startsWith("/fonts/")).toBe(true);
    }
  });

  test("have a server route, so the catch-all does not answer with HTML", () => {
    // The dev server has a catch-all that serves the app shell. Without an
    // explicit route, a request for /fonts/fonts.css comes back as HTML
    // and the browser cannot parse it as a stylesheet.
    const server = readFileSync(SERVER, "utf8");
    const css = readFileSync(join(PUBLIC_FONTS, "fonts.css"), "utf8");
    const referenced = [...css.matchAll(/url\("\/fonts\/([^"]+)"\)/g)].map(
      (match) => match[1]!,
    );
    expect(referenced.length).toBeGreaterThan(0);

    // Every font the stylesheet references needs its own route.
    for (const name of referenced) {
      expect(`${name}: ${server}`).toContain(`"/fonts/${name}"`);
    }
    expect(server).toContain('"/fonts/fonts.css"');
  });
});

describe("motion system", () => {
  test("lives in a single stylesheet", () => {
    const motion = readFileSync(join(SRC, "ui", "motion.css"), "utf8");
    expect(motion).toContain("@keyframes motion-enter");
    expect(motion).toContain("@keyframes motion-pop");
    expect(motion).toContain(".motion-stagger");
  });

  test("defines every duration and curve as a token", () => {
    // No component may hardcode a duration; the tokens live in index.css
    // so the whole app moves at the same speed.
    const index = readFileSync(join(SRC, "index.css"), "utf8");
    for (const token of [
      "--motion-fast",
      "--motion-base",
      "--motion-slow",
      "--motion-spring",
      "--motion-out",
      "--motion-in",
    ]) {
      expect(`${token}: ${index}`).not.toMatch(/=\s*$/);
    }
  });

  test("is neutralised by the reduce-motion switch", () => {
    const index = readFileSync(join(SRC, "index.css"), "utf8");
    expect(index).toContain("prefers-reduced-motion: reduce");
    expect(index).toContain('data-motion="reduced"');
  });
});
