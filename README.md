# Aksaraku 🎨🔤

Aplikasi edukasi interaktif PWA offline-first untuk balita (3+) yang berfokus pada tracing huruf, angka, bentuk (shapes), mini-games, gamifikasi reward, parent dashboard, dan dukungan multi-bahasa (id / en / ar RTL).

## 🛠️ Tech Stack

- **Runtime & Tooling**: [Bun](https://bun.sh) (Strict TypeScript, HMR, native bundler)
- **Frontend**: React 19 (`19.2.8`), PixiJS 8 (Canvas 2D tracing), @react-three/fiber + Three.js (Avatar 3D & Celebration)
- **State & Domain**: `fp-ts` (Either/TaskEither), `ts-pattern` (state machines)
- **Storage**: IndexedDB via Dexie (Offline-first)
- **i18n**: `i18next` + `react-i18next` (Indonesian, English, Arabic RTL)
- **Hosting**: Cloudflare Pages (`aksaraku.pages.dev`)

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
bun test
```

### Build & Preview
```bash
NODE_ENV=production bun run build
bun start
```

### Deploy to Cloudflare Pages
```bash
bash deploy.sh
```

## 📄 Documentation

- [AGENTS.md](./AGENTS.md) - Roster tim AI & instruksi workflow
- [CLAUDE.md](./CLAUDE.md) - Konvensi kode, arsitektur, & aturan runtime
- [docs/infra/architecture.md](./docs/infra/architecture.md) - Arsitektur sistem & routing Cloudflare Pages
