# PRD: Avatar Species

## 1. Problem Statement
The profile screen asks the child to pick an avatar emoji (cat, bear, rabbit,
fox, panda, frog), and the 3D character on Beranda and Karakter ignored it:
every child got the same round blob. The emoji and the character disagreed,
so the "this is my character" idea broke at the first screen.

## 2. Scope (In Scope)
- A species table (`src/data/species.ts`) keyed by avatar id, holding the fur
  colour, ear shape, ear colour, inner-ear colour, face marking, nose, mouth,
  whiskers and tail for each creature.
- `defaultAvatarFor(parts, speciesId)` seeds a new profile with the species
  fur colour and ear shape; a saved config still wins, so a child who picked
  blue stays blue.
- 3D features drawn on top of the existing body: panda eye patches, muzzle,
  nose, whiskers, wide frog mouth, inner ear and a tail per species.
- Two new colour parts (cream, brown) and two new ear shapes (long, none) so
  each species has a swatch that matches its fur and ears.
- The WebGL fallback emoji now matches the profile instead of always 🐻.

## 3. Non-Goals (Out of Scope)
- Changing the species from inside the app; it stays tied to the profile.
- Migrating saved configs of existing profiles to the new defaults.
- Per-species body proportions or head shapes.

## 4. Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Species readable | 6/6 distinguishable at 260px | screenshots |
| Customization intact | colour/eyes/accessory still apply | screenshots |
| Quality gates | typecheck + tests + build | CI |

## 5. Acceptance Criteria (Given/When/Then)
- **Given** a new profile created with the panda avatar
- **When** Beranda or Karakter renders the character
- **Then** it has cream fur, black round ears and black eye patches
- **Given** that panda profile
- **When** the child picks blue fur and happy eyes
- **Then** the body turns blue and the ears and patches stay black
- **Given** an unknown avatar id
- **When** the scene resolves the species
- **Then** it falls back to the default look instead of crashing
- **Given** the branch is checked out
- **When** `bunx tsc --noEmit`, `bun test src` and `bun run build` run
- **Then** all three exit 0

## 6. Verification
- `bunx tsc --noEmit`: clean
- `bun test src`: 249 pass
- `bun run build`: exit 0
- Playwright at 390×844 (reduced motion, front-facing) for all six species,
  plus a customised panda and the 1440px home hero
