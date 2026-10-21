import { serve } from "bun";
import index from "./index.html";
import landing from "./landing.html";

const staticFile = (path: string, contentType: string) => ({
  GET: () => new Response(Bun.file(path), { headers: { "content-type": contentType } }),
});

/** In production, prefer the built asset so the precached service worker wins. */
const assetPath = async (name: string): Promise<string> => {
  if (process.env.NODE_ENV === "production") {
    const built = `dist/${name}`;
    if (await Bun.file(built).exists()) return built;
  }
  return `public/${name}`;
};

/**
 * The fonts directory. `Bun.file().exists()` is false for a directory, so
 * this checks the directory itself rather than a file inside it.
 */
const fontsDir = await (async () => {
  if (process.env.NODE_ENV === "production") {
    const built = "dist/fonts";
    if (await Bun.file(`${built}/fonts.css`).exists()) return built;
  }
  return "public/fonts";
})();

const [swPath, manifestPath, iconPath] = await Promise.all([
  assetPath("sw.js"),
  assetPath("manifest.webmanifest"),
  assetPath("icon.svg"),
]);

/**
 * The self-hosted web fonts. They live in `public/fonts/` so the build
 * copies them verbatim instead of the CSS bundler base64-inlining them
 * (see `src/platform/fonts.ts` for the full reasoning).
 *
 * The catch-all route below would otherwise answer these requests with the
 * app shell, and the browser would try to parse HTML as CSS.
 */
const fontFile = (name: string) => ({
  GET: async () => {
    const file = Bun.file(`${fontsDir}/${name}`);
    if (!(await file.exists())) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(file, {
      headers: { "content-type": "font/woff2" },
    });
  },
});

const server = serve({
  routes: {
    "/manifest.webmanifest": staticFile(
      manifestPath,
      "application/manifest+json",
    ),
    "/sw.js": staticFile(swPath, "text/javascript"),
    "/icon.svg": staticFile(iconPath, "image/svg+xml"),
    "/fonts/fonts.css": staticFile(`${fontsDir}/fonts.css`, "text/css"),
    "/fonts/nunito-latin.woff2": fontFile("nunito-latin.woff2"),
    "/fonts/nunito-latin-ext.woff2": fontFile("nunito-latin-ext.woff2"),
    "/fonts/baloo2-latin.woff2": fontFile("baloo2-latin.woff2"),
    "/fonts/baloo2-latin-ext.woff2": fontFile("baloo2-latin-ext.woff2"),
    "/fonts/baloo-bhaijaan2-arabic.woff2": fontFile(
      "baloo-bhaijaan2-arabic.woff2",
    ),
    "/api/health": {
      GET: () => Response.json({ status: "ok", app: "aksaraku" }),
    },
    "/": landing,
    "/app": index,
    "/app/*": index,
    "/*": index,
  },
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Aksaraku berjalan di ${server.url}`);
