/**
 * Injects the built asset list into `dist/sw.js` so the service worker can
 * precache the whole app. Without this, lazy chunks (the 3D avatar scene) would
 * only be cached after the child opens that screen once — and would fail
 * offline before that.
 *
 * Usage: bun scripts/build-sw.ts   (run after `bun build` + `cp public/. dist/`)
 */
const DIST = "dist";
const SW_PATH = `${DIST}/sw.js`;
const PRECACHE_LINE = /^const PRECACHE = \[.*\];$/m;

const toRoute = (file: string): string => {
  const normalized = file.split("\\").join("/");
  return normalized === "index.html" ? "/" : `/${normalized}`;
};

/**
 * The app shell must be reachable offline under the URL the child actually
 * navigates to. Cloudflare serves `/app/` from `dist/app/index.html` (see
 * public/_redirects), so that exact route has to be precached — otherwise the
 * navigation fallback in public/sw.js answers with the landing page and the
 * app never opens offline.
 */
const APP_ROUTES = ["/app/"];

const glob = new Bun.Glob("**/*");
const files: string[] = [];
for await (const file of glob.scan({ cwd: DIST, onlyFiles: true })) {
  if (file.endsWith(".map") || file === "sw.js") continue;
  // `dist/app/index.html` and `dist/app.html` are copies of the same shell.
  // Only the canonical route "/app/" is precached; the copies would just
  // duplicate the HTML in the cache.
  if (file === "app.html" || file === "app/index.html") continue;
  files.push(toRoute(file));
}
files.push(...APP_ROUTES);
files.sort();

if (files.length === 0) {
  throw new Error(`No assets found in ${DIST}/ — did the build run?`);
}

const source = await Bun.file(SW_PATH).text();
if (!PRECACHE_LINE.test(source)) {
  throw new Error(`PRECACHE marker not found in ${SW_PATH}`);
}

const next = source.replace(
  PRECACHE_LINE,
  `const PRECACHE = ${JSON.stringify(files, null, 2)};`,
);

await Bun.write(SW_PATH, next);
console.log(`✅ sw.js precache: ${files.length} berkas`);
