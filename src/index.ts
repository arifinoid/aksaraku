import { serve } from "bun";
import index from "./index.html";

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

const [swPath, manifestPath, iconPath] = await Promise.all([
  assetPath("sw.js"),
  assetPath("manifest.webmanifest"),
  assetPath("icon.svg"),
]);

const server = serve({
  routes: {
    "/manifest.webmanifest": staticFile(
      manifestPath,
      "application/manifest+json",
    ),
    "/sw.js": staticFile(swPath, "text/javascript"),
    "/icon.svg": staticFile(iconPath, "image/svg+xml"),
    "/api/health": {
      GET: () => Response.json({ status: "ok", app: "aksaraku" }),
    },
    "/*": index,
  },
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Aksaraku berjalan di ${server.url}`);
