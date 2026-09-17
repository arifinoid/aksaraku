import { serve } from "bun";
import index from "./index.html";

const staticFile = (path: string, contentType: string) => ({
  GET: () => new Response(Bun.file(path), { headers: { "content-type": contentType } }),
});

const server = serve({
  routes: {
    "/manifest.webmanifest": staticFile(
      "public/manifest.webmanifest",
      "application/manifest+json",
    ),
    "/sw.js": staticFile("public/sw.js", "text/javascript"),
    "/icon.svg": staticFile("public/icon.svg", "image/svg+xml"),
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
