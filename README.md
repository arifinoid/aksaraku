# Aksaraku 🎨🔤

Aplikasi edukasi interaktif PWA offline-first untuk balita (3+) yang berfokus pada tracing huruf, angka, bentuk (shapes), mini-games, gamifikasi reward, parent dashboard, dan dukungan multi-bahasa (id / en / ar RTL).

## 🛠️ Tech Stack

- **Runtime & Tooling**: [Bun](https://bun.sh) (Strict TypeScript, HMR, native bundler)
- **Frontend**: React 19 (`19.2.8`), PixiJS 8 (Canvas 2D tracing), @react-three/fiber + Three.js (Avatar 3D & Celebration)
- **State & Domain**: `fp-ts` (Either/TaskEither), `ts-pattern` (state machines)
- **Storage**: IndexedDB via Dexie (Offline-first)
- **i18n**: `i18next` + `react-i18next` (Indonesian, English, Arabic RTL)
- **Hosting**: VPS (`aksaraku.arifinoid.web.id`) + Cloudflare Pages (preview)
- **Analytics**: self-hosted GoatCounter (`stats.arifinoid.web.id`), cookieless

## 🚀 Quick Start

### Install Dependencies
```bash
bun install
```

### Development Server
```bash
bun dev
```
Akses server di `http://localhost:3000`.

### Typecheck & Test
```bash
bunx tsc --noEmit
bun test src
```

> `bun test src`, bukan `bun test` polos — perintah polos ikut mem-glob
> `tests/e2e/*.spec.ts` dan gagal, karena `test.describe()` milik Playwright
> hanya jalan di runner-nya sendiri. Lihat [KAN-11](./docs/kanban.md).

### Build & Preview
```bash
NODE_ENV=production bun run build
bun start
```

### Deploy to Cloudflare Pages
```bash
bash deploy.sh
```

### Deploy to the VPS
Pushes to `main` deploy to `/var/www/aksaraku` when the repository variable
`VPS_DEPLOY_ENABLED=true` is set and the `VPS_HOST` / `VPS_SSH_KEY` secrets
exist. nginx serves the release from `https://aksaraku.arifinoid.web.id`;
the three newest releases are kept for rollback. See
[docs/specs/vps-deploy-analytics.md](./docs/specs/vps-deploy-analytics.md).

## 📄 Documentation

- [AGENTS.md](./AGENTS.md) - Roster tim AI & instruksi workflow
- [CLAUDE.md](./CLAUDE.md) - Konvensi kode, arsitektur, & aturan runtime
- [docs/kanban.md](./docs/kanban.md) - Backlog terbuka hasil audit (P0–P2, siap dikerjakan)
- [docs/infra/architecture.md](./docs/infra/architecture.md) - Arsitektur sistem & routing Cloudflare Pages
