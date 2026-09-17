
Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.

## Project: Aksaraku

Aplikasi edukasi interaktif untuk balita (3+): tracing huruf/angka/shapes, mini-games,
gamifikasi, dan parent dashboard. Bahasa target: id -> en -> ar (RTL).
Referensi: `plans/features.md` (fitur), `plans/architecture.md` (arsitektur), `plans/roadmap.md` (detail plan).

### Platform

- PWA (installable, offline-first, touch-first untuk tablet). Bukan native/Expo.
- Offline 100%: semua aset & audio di-cache via Service Worker + IndexedDB. Tanpa iklan.
- Haptic via `navigator.vibrate` (opsional, degrade gracefully).
- Target sentuh minimal 64px; dilarang mengandalkan hover.

### Stack

- Bun + React 19 + TypeScript strict (sudah ada di repo).
- Domain logic: `fp-ts` (Either/TaskEither) + `ts-pattern` (state machine).
- Tracing: PixiJS (canvas 2D, presisi) - BUKAN 3D.
- Scene 3D (avatar/reward): `@react-three/fiber` + `three`.
- Animasi UI: Motion (Framer Motion). Audio: Web Audio API + preload.
- Client storage: IndexedDB (Dexie). Server/opsional sync: `bun:sqlite`.
- i18n: `i18next`, locale id/en/ar, dukungan RTL untuk ar.
- Test: `bun test`. Lint/typecheck: `bunx tsc --noEmit`.

### Struktur folder

`src/domain` (pure, tanpa React), `src/game`, `src/features`, `src/ui`,
`src/i18n`, `src/data`, `src/storage`, `src/index.ts`, `src/index.html`.

### Aturan wajib

- `src/domain/**` HARUS pure & bebas React/DOM - semua efek di edge.
- Semua teks user-facing lewat i18n; jangan hardcode string.
- Parental gate wajib sebelum Settings, pembelian, atau keluar profil.
- Kunci tombol back/keluar saat game berjalan (no-accidental-click).
- Jangan tambah dependency baru tanpa alasan; ikuti larangan di section atas
  (no express/vite/ws/pg/better-sqlite3).

### Status fase

- [x] M0 Fondasi
- [x] M1 Tracing Engine
- [ ] M2 Konten Aksara
- [ ] M3 Mini Games
- [ ] M4 Gamifikasi
- [ ] M5 Parent Dashboard
- [ ] M6 Aksesibilitas & rilis
- [ ] M7 Multi-bahasa penuh
