# AI Engineering Team — Aksaraku Launch Team

> Rohmad's AI Engineering Team for Aksaraku — PWA edukasi balita (3+) tracing huruf/angka/shapes, mini-games, gamifikasi, parent dashboard, i18n (id/en/ar RTL), offline-first, Service Worker.

## Team Roster

| Profile | Role | Focus |
|---------|------|-------|
| `planner` | Product Planner / PM | Launch plan, landing page spec, metrics, prioritization |
| `backend-dev` | Backend Engineer | Cloudflare Workers/Pages config, SQLite sync, API endpoints |
| `frontend-dev` | Frontend Engineer | PWA build, landing page, performance, accessibility |
| `qa-engineer` | QA Engineer | Device testing (tablet touch), regression, a11y audit |
| `devops` | DevOps Engineer | Cloudflare Pages deploy, CI/CD, custom domain, monitoring |

**Coordinator**: `default` profile (kentung) — Rohmad's personal assistant.

## Project Context

**Repo**: `/home/ubuntu/aksaraku` (existing, MVP-complete)
**Stack**: Bun + React 19 + TypeScript + PixiJS + @react-three/fiber + Dexie + i18next
**Hosting**: Cloudflare Pages (free tier, subdomain `aksaraku.pages.dev`)
**Deploy**: `bash deploy.sh` (requires `wrangler login` from laptop)

## Sprint 1: Launch Ready (Week 1)

### Critical Path
1. **Cloudflare auth & deploy** — `wrangler login` → `bash deploy.sh`
2. **Device testing** — Tablet Android/iOS: tracing accuracy, touch targets 64px, haptic, audio
3. **Performance audit** — Lighthouse PWA score, bundle size, offline cache
4. **Custom subdomain** — `aksaraku.pages.dev` live & HTTPS

### Landing Page (Parallel)
1. **Design brief** → `docs/specs/landing-page-brief.md` (planner)
2. **Implement** → `/landing` route or separate `landing/` folder (frontend-dev)
3. **Deploy** → Same domain `/` path

## Workflow

### Task Management
- Board: `digital-product` (Kanban)
- Workdir: `/home/ubuntu/aksaraku`
- Tasks created via: `hermes kanban --board digital-product create "title" --assignee <profile> --workspace dir:/home/ubuntu/aksaraku`
- **CRITICAL**: Always use `--workspace dir:/home/ubuntu/aksaraku` (scratch workspaces are ephemeral)

### Sprint Cycle
1. **Planning** (planner): Define sprint goals, create Kanban tasks, assign to agents
2. **Development** (backend-dev, frontend-dev): Pick up tasks, implement, create PRs
3. **Review** (qa-engineer): Code review, run tests, block/approve
4. **Deploy** (devops): Cloudflare Pages deploy
5. **Retro** (planner): Summarize what went well, what didn't, action items

### Communication Protocol
- Tag agents in task descriptions: `@backend-dev`, `@frontend-dev`, etc.
- Comments on tasks via: `hermes kanban comment <task-id> "message"`
- Specs in `docs/specs/`, ADRs in `docs/adr/`, runbooks in `docs/runbooks/`

## Coding Conventions

### Git
- Branch naming: `feat/<task-id>-<slug>`, `fix/<task-id>-<slug>`, `chore/<slug>`
- Commit format: `type(scope): message` (conventional commits)
- PRs require: description, test plan, breaking changes note
- Squash merge to `main`

### Code Style (per CLAUDE.md)
- **Runtime**: Bun (no Node.js, no Express, no Vite, no better-sqlite3, no pg, no ws)
- **Testing**: `bun test` only
- **Typecheck**: `bunx tsc --noEmit`
- **Build**: `NODE_ENV=production bun run build` (env var, not --define)
- **Dependencies**: No new deps without reason (see CLAUDE.md forbidden list)

### Definition of Done
- [ ] Code written and self-reviewed
- [ ] Tests written and passing (`bun test`)
- [ ] Typecheck passes (`bunx tsc --noEmit`)
- [ ] Linting passes (ESLint if configured)
- [ ] PR reviewed by qa-engineer
- [ ] Documentation updated
- [ ] Deployed to Cloudflare Pages preview
- [ ] Smoke test on real device (tablet preferred)

## File Structure

```
aksaraku/
├── AGENTS.md              # This file
├── CLAUDE.md              # Project conventions (authoritative)
├── deploy.sh              # Deploy script (run from laptop after wrangler login)
├── wrangler.toml          # Cloudflare Pages config
├── package.json           # Bun + deps
├── dist/                  # Production build (gitignored)
├── public/                # Static assets, manifest, sw.js
├── src/
│   ├── app/               # Routing, contexts
│   ├── data/              # Phonemes, content
│   ├── domain/            # Pure logic (no React/DOM)
│   ├── features/          # Feature screens
│   ├── game/              # Game logic
│   ├── i18n/              # Locales (id/en/ar + RTL)
│   ├── platform/          # Task runner
│   ├── storage/           # IndexedDB (Dexie) + SQLite
│   ├── ui/                # Reusable components
│   ├── App.tsx            # Root component
│   ├── index.ts           # Entry point (Bun.serve)
│   └── index.html         # HTML entry
├── scripts/
│   └── build-sw.ts        # Service Worker precache injector
└── tests/                 # bun test files
```

## Tooling
- **RTK**: Terminal output compression — active at gateway level (~45% savings)
- **Hermes compression**: Context window compression (threshold 50%, target 20%)
- **Ruang**: 3D mission control at http://127.0.0.1:3001
- **Kanban**: `hermes kanban --board digital-product`

## Known Limitations & Workarounds

### Workdir
`terminal.workdir` in config does not propagate to chat sessions or Kanban tasks.
**Workaround**: Always use `--workspace dir:/home/ubuntu/aksaraku` when creating Kanban tasks:
```bash
hermes kanban --board digital-product create "task title" \
  --assignee backend-dev \
  --workspace dir:/home/ubuntu/aksaraku
```

### Skills Per Profile
Hermes does not support granular per-skill toggling per profile. `hermes skills opt-out` is all-or-nothing (nuclear).
**Workaround**: Each SOUL.md lists which skills to prioritize. Use `--skills` flag on Kanban tasks to preload specific skills:
```bash
hermes kanban --board digital-product create "implement API" \
  --assignee backend-dev \
  --workspace dir:/home/ubuntu/aksaraku \
  --skills test-driven-development,systematic-debugging
```

## Current Sprint Tasks (to be created)

See `hermes kanban --board digital-product list`