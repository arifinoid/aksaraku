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
 * This script also injects the font stylesheet link into every HTML entry.
 * The fonts cannot be declared in `src/index.css` because Bun's CSS bundler
 * inlines every `@font-face` font as a base64 data URL (~180 KB on the
 * critical path). Declaring the sheet at runtime (see `src/platform/fonts.ts`)
 * works around that, but it makes the browser wait for the JS bundle to
 * download before it learns the fonts exist — which shows up as a flash of
 * fallback font on a slow tablet. A `<link>` in the document head starts the
 * font request in parallel with the script instead.
 *
 * Usage: bun scripts/build-app-dir.ts   (after `bun build` + `cp public/. dist/`)
 */
const DIST = "dist";
const APP_HTML = `${DIST}/index.html`;
const APP_DIR = `${DIST}/app`;
const LANDING_HTML = `${DIST}/landing.html`;

const FONT_LINK = '<link rel="stylesheet" href="/fonts/fonts.css">';

// A font preload must be a CORS request, and so must the font fetch it is
// meant to pre-empt — otherwise the browser downloads the file twice.
const PRELOADS = [
  '<link rel="preload" href="/fonts/nunito-latin.woff2" as="font" type="font/woff2" crossorigin="anonymous">',
  '<link rel="preload" href="/fonts/baloo2-latin.woff2" as="font" type="font/woff2" crossorigin="anonymous">',
];

/** Injects the font links right before `</head>`, unless they are there. */
const withFontLinks = (html: string): string => {
  if (html.includes("/fonts/fonts.css")) return html;
  const links = [FONT_LINK, ...PRELOADS].join("\n    ");
  return html.replace("</head>", `    ${links}\n  </head>`);
};

const shell = await Bun.file(APP_HTML).text();

// The shell is served at BOTH / (where ./ resolves to dist root — fine) and
// /app/ (where ./ resolves to /app/* — assets don't exist there, so the SPA
// fallback serves HTML at the asset URL and the app renders blank). The app
// copies therefore get root-absolute asset refs; dist/index.html itself is
// left untouched to keep the change minimal.
const absolute = shell
  .replaceAll('href="./', 'href="/')
  .replaceAll('src="./', 'src="/');

// Copy the app shell under public/ so build-sw.ts precaches it too.
await Bun.write(`${DIST}/app.html`, withFontLinks(absolute));
await Bun.write(`${APP_DIR}/index.html`, withFontLinks(absolute));

// The root entry stays reachable at /index.html, so it needs the font
// links too. Its asset refs stay relative — they already resolve there.
await Bun.write(APP_HTML, withFontLinks(shell));

// The landing page has its own HTML entry; give it the same font links.
const landing = await Bun.file(LANDING_HTML).text();
await Bun.write(LANDING_HTML, withFontLinks(landing));

console.log("✅ app shell: dist/app/index.html (+ dist/app.html) written");
console.log("✅ font stylesheet linked in both HTML entries");
