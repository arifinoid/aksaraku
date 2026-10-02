/**
 * Creates `dist/app/index.html` from `dist/index.html` so the app shell is
 * served as a real directory index at `/app/`.
 *
 * Why: Cloudflare Pages' pretty-URL normalization runs BEFORE `_redirects`
 * rules and emits hard 308s for paths that normalize onto an existing asset
 * (e.g. `/app` -> `/` for dist/index.html, `/index.html` -> `/`). Those 308s
 * cannot be shadowed by 200-rewrite rules. Making `/app/` a real directory
 * index avoids normalization entirely; `/app` then lands on `/app/` via the
 * platform's own directory redirect. See docs/infra/cloudflare-pages-routing.md.
 *
 * The standalone `dist/index.html` entry is kept: bun build emits it from
 * `src/index.html` and it preserves the previous /index.html path.
 *
 * Usage: bun scripts/build-app-dir.ts   (after `bun build` + `cp public/. dist/`)
 */
const DIST = "dist";
const APP_HTML = `${DIST}/index.html`;
const APP_DIR = `${DIST}/app`;

const shell = await Bun.file(APP_HTML).text();

// Copy the app shell under public/ so build-sw.ts precaches it too.
await Bun.write(`${DIST}/app.html`, shell);
await Bun.write(`${APP_DIR}/index.html`, shell);

console.log("✅ app shell: dist/app/index.html (+ dist/app.html) written");
