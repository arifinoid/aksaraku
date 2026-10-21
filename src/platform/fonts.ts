/**
 * Loads the self-hosted web fonts.
 *
 * Why a runtime <link> instead of an import in the stylesheet: Bun's CSS
 * bundler inlines every font referenced by an `@font-face` rule as a base64
 * data URL. That would add roughly 180 KB of base64 to the critical-path
 * stylesheet, which delays the first paint of the app the child is waiting
 * for. The font stylesheet lives in `public/fonts/fonts.css` and is copied
 * into `dist/` verbatim, so the fonts ship as separate cacheable files that
 * the service worker precaches for offline use.
 *
 * The link is added before the app renders, and the fonts are preloaded in
 * parallel, so a warm cache means no visible reflow.
 */

const FONT_STYLESHEET = "/fonts/fonts.css";

/**
 * The files that are worth preloading: the two body/display faces for the
 * Latin script. The Arabic face is only preloaded for Arabic, and the
 * `latin-ext` subsets are only used by a handful of characters, so they are
 * left to be fetched on demand.
 */
const PRELOADS: readonly { readonly href: string; readonly type: string }[] = [
  { href: "/fonts/nunito-latin.woff2", type: "font/woff2" },
  { href: "/fonts/baloo2-latin.woff2", type: "font/woff2" },
];

const isArabic = (): boolean =>
  document.documentElement.lang === "ar" ||
  document.documentElement.dir === "rtl";

const addLink = (
  rel: string,
  href: string,
  type?: string,
  crossOrigin = false,
): void => {
  if (document.head.querySelector(`link[rel="${rel}"][href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = rel;
  link.href = href;
  if (type) link.type = type;
  // A font preload has to declare what it is preloading, and it has to be
  // a CORS request to match the font fetch it is meant to pre-empt —
  // otherwise the browser warns and downloads the file twice.
  if (rel === "preload") link.setAttribute("as", "font");
  if (crossOrigin) link.crossOrigin = "anonymous";
  document.head.append(link);
};

export const setupFonts = (): void => {
  if (typeof document === "undefined") return;

  // The build already injects these links into the HTML head (see
  // scripts/build-app-dir.ts) so the font request starts in parallel with
  // the script download. This is the fallback for the dev server, where
  // that injection does not happen.
  addLink("stylesheet", FONT_STYLESHEET, "text/css");

  const preloads = isArabic()
    ? [...PRELOADS, { href: "/fonts/baloo-bhaijaan2-arabic.woff2", type: "font/woff2" }]
    : PRELOADS;

  for (const { href, type } of preloads) {
    addLink("preload", href, type, true);
  }
};
