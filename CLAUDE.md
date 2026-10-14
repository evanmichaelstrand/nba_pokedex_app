# CLAUDE.md

## Before starting any work

Read `SPEC.md` (what we're building) and `PLAN.md` (current progress). Work on one plan item at a time and check it off when done. If the spec is ambiguous, ask instead of guessing.

## Project overview

- The web app lives at the repo root: a static, read-only Vite + React + TypeScript single-page app that displays `nba_pokemon_matches_unique_<season>.csv`.
- The Python data pipeline that produces the CSV lives in a separate repo; this repo only consumes its output.
- No backend yet; one is planned for later. No runtime API calls except loading images by ID from the NBA CDN and PokéAPI sprites.

## Commands

```
npm install
npm run dev        # local dev server
npm run build      # type-check + production build
npm run lint
npm test           # Vitest unit tests
npm run test:e2e   # Playwright smoke tests
```

**Before calling any task done:** `npm run lint`, `npm test`, and `npm run build` must all pass. For UI changes, also run the e2e tests and check the result at mobile size (390×844) and desktop size.

## Architecture rules

- All data access goes through the `EntrySource` interface in `src/data/`. CSV parsing and row validation live only in `CsvEntrySource`. Components and hooks receive typed `Entry` objects and never know the data came from a CSV, so a future API source can replace it without UI changes.
- The CSV column names are defined once in `CsvEntrySource` and must match `SPEC.md` exactly. The `Entry` type is a clean domain shape, not a copy of the CSV columns.
- Use `PLAYER_ID` as the entry ID everywhere; never use array index as identity.
- Environment-specific settings go through `import.meta.env` and are documented in `.env.example`.
- Don't hardcode row counts, player names, or season-specific values. The CSV will be replaced with a newer file.
- Team abbreviation → name/color lookup is a single static map in `src/lib/teams.ts`.
- Image URL builders live in one place (`src/lib/images.ts`), with a placeholder fallback on error.
- The logo rotation step is a single exported constant (default 20°).

## Code style

- TypeScript strict mode; no `any`.
- Function components and hooks only.
- Plain CSS with custom properties for colors and spacing; no UI component libraries.
- Small, focused components. If a file passes about 200 lines, split it.
- Pure functions in `src/lib/` get unit tests.

## Don'ts

- Don't build the backend, server functions, database, or auth yet. Do keep the data layer swappable as described in SPEC.md.
- Don't add dependencies without saying why; prefer a few lines of code over a new package.
- Don't add features listed as non-goals in `SPEC.md`.
- Don't edit the CSV by hand; replace the file in `public/data/` when a new one is provided.

## Git

Commit after each completed plan item with a short, descriptive message.
