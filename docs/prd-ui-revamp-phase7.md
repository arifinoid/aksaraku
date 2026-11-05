# PRD: UI Revamp — Phase 7: Remaining Screens

## 1. Problem Statement
Phases 1–6 rebuilt the landing page, Beranda, Ayo Menulis, the mini-games,
Koleksi, Karakter and the parent area from the pen.dev file. Four screens were
left on the pre-revamp design system: the profile picker, the parent gate,
the content preview and the letter tracing header. They still used the old
`.panel`/`.field`/`.btn` primitives, so opening them looked like a
different app.

## 2. Scope (In Scope) — Phase 7
- **Profiles (21 · Tambah Anak, 22 · Ganti Anak)**: sheet-shaped card, handle,
  title 23, subtitle 11.5, one row per child (44 avatar, name 14, language
  meta 9.5) and an "Tambah Anak" row. The add form carries the pen's avatar
  picker (six 54px circles, coral ring + check badge on the selected one),
  48px inputs with a coral focus ring and the Batal / Simpan action row.
- **Parent gate (13 · Khusus Orang Tua, 24 · PIN Salah)**: back pill, 78px
  shield badge, title 27, one-sentence sub, question card radius 26 with a
  54px answer field, Batal / Masuk row and the safety note. A wrong answer
  turns the card and field red and shows the error row from frame 24.
- **Preview (23 · Pratinjau Konten)**: back pill and title 20, lead line, one
  card per category (radius 22, title 15, counter 10) with 34px glyph chips,
  the "does not add progress" note and a close button.
- **Tracing header (04 · Tracing Huruf A)**: the bar titles the glyph alone
  instead of repeating the word row in a subtitle.
- Session-lock keeps a compact gate: it already draws its own card, so the
  shield and title are dropped there.

## 3. Non-Goals (Out of Scope)
- The attempt counter in frame 24 ("Sisa 2 percobaan"); the app has no
  attempt limit, so only the error styling is adopted.
- The pen's fake iOS status bar.
- Reward emoji: they are content, not decoration.

## 4. Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| No overflow | scrollWidth == viewport at 320/390/1440 | Playwright |
| Quality gates | typecheck + tests + build | CI |
| RTL parity | mirrored layout, no clipped copy | Playwright (ar) |

## 5. Acceptance Criteria (Given/When/Then)
- **Given** a first run with no profiles
- **When** `/app` renders
- **Then** the "Tambah Anak" form matches frame 21 and saves a profile
- **Given** the parent gate
- **When** a wrong answer is submitted
- **Then** the card and field turn red and the error row appears
- **Given** Pratinjau Konten
- **When** it renders
- **Then** each category is a card with a counter and glyph chips
- **Given** the branch is checked out
- **When** `bunx tsc --noEmit`, `bun test src` and `bun run build` run
- **Then** all three exit 0

## 6. Verification
- `bunx tsc --noEmit`: clean
- `bun test src`: 244 pass
- `bun run build`: exit 0
- Playwright 390×844 and 1440×900 across all 17 screens; Arabic pass over
  the gate and preview (dir=rtl)
