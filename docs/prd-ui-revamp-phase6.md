# PRD: UI Revamp — Phase 6: Landing (Onboarding Screen)

## 1. Problem Statement
The public landing page shipped a generic marketing layout: hero, feature
cards, three steps, trust badges, language pills, footer. The pen.dev file
defines a single screen, 01 · Onboarding & Bahasa, and the landing page is
its public entry point. The two looked unrelated, so the landing is rebuilt
to that screen rather than restyled around it.

## 2. User & Persona
- **Primary user**: a parent opening the install link on a phone.
- **Pain point**: the page asks them to read four sections before it offers
  one action, and it does not look like the app they are about to install.

## 3. Scope (In Scope) — Phase 6
- Rebuild the landing markup as the pen frame: brand row with age pill,
  mascot block (blob, dots, fox, speech bubble), one headline, one subhead,
  the three promises, the language picker and one primary action.
- 390px column, 24px gutters, 20px stack — the pen's frame, centred on
  wider viewports.
- Language chips are the real locale switch (id / en / ar), replacing the
  nav dropdown.
- Keep install flow, PWA setup and i18n wiring unchanged.
- Fox mascot copied path-for-path from the pen component.

## 4. Non-Goals (Out of Scope)
- The fake iOS status bar in the pen frame; a browser already draws chrome.
- Marketing sections that the pen screen does not contain (features, how it
  works, trust badges, footer).

## 5. Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| No overflow | scrollWidth == viewport at 320/390/1440 | Playwright |
| Fits one phone screen | scrollHeight <= 844 at 390×844 | Playwright |
| Chips switch locale | headline + dir change | Playwright |
| Quality gates | typecheck + tests + build | CI |

## 6. Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Install flow regresses | Low | Med | install logic untouched; modal re-verified |
| Long translations overflow a chip | Med | Low | chips are 1fr each; copy shortened to the pen's labels |
| RTL composition flips the mascot | Low | Low | mascot offsets are physical, only the CTA arrow mirrors |

## 7. Acceptance Criteria (Given/When/Then)
- **Given** the landing page at 390×844
- **When** it renders
- **Then** it matches 01 · Onboarding & Bahasa and scrolls no further than
  the viewport
- **Given** the language chips
- **When** English or العربية is picked
- **Then** the copy switches and Arabic sets `dir="rtl"`
- **Given** the branch is checked out
- **When** `bunx tsc --noEmit`, `bun test src` and `bun run build` run
- **Then** all three exit 0

## 8. Verification
- `bunx tsc --noEmit`: clean
- `bun test src`: 244 pass
- `bun run build`: exit 0
- Playwright 390×844 / 320×700 / 1440×900: scrollWidth == innerWidth, no
  horizontal overflow; 390 scrollHeight 844
