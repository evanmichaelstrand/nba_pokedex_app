# PLAN

Work one item at a time; check it off and commit when done (lint, unit tests, and build passing; e2e + mobile/desktop check for UI items).

## Setup

- [x] 1. **Scaffold** — Vite + React + TS (strict), oxlint, Vitest, Playwright, Papa Parse. `.gitignore`, `.env` / `.env.example` (`VITE_DATA_SOURCE`, `VITE_CSV_URL`), base stylesheet with color/spacing custom properties. Real CSV and logos in `public/`.

## Data layer

- [x] 2. **Entry type + EntrySource** — `Entry` domain type (camelCase, `otherTeams: string[]`, optional `position`, optional supporting stats), `EntrySource` interface, `CsvEntrySource` (column names defined once, row validation, skip + log bad rows), source selection from `import.meta.env`. Unit tests.
- [x] 3. **lib helpers** — `teams.ts` (30 teams: name + color, unknown passes through), formatting (Pokémon display name incl. "Mega X", Dex number hidden above 10000, match %, height), `images.ts` (URL builders + placeholder). Unit tests.
- [ ] 4. **useEntries + loading/error states (F4)** — async hook over `EntrySource`; loading view and friendly error view.

## Entry view and navigation

- [ ] 5. **EntryCard (F1)** — player, teams, Pokémon, TypeBadge, StatBars on a shared scale, match %. Image fallback to silhouette. Fits 390×844 without scrolling.
- [ ] 6. **Navigation (F2, part 1)** — deck index by `PLAYER_ID`, prev/next buttons, ← / → keys, wraparound, position indicator. Default order by Pokémon ID.
- [ ] 7. **Swipe (F2, part 2)** — `useSwipe` with pointer events (touch + mouse), threshold snap-back, no skipping/desync on rapid swipes.
- [ ] 8. **Rotating logo (F3)** — cumulative rotation constant (20°), 300–400 ms ease-out, instant under `prefers-reduced-motion`. Rotation math unit-tested.

## Search, sort, URL

- [ ] 9. **Search (F5)** — pure matching function (player, Pokémon display name, main + other team name/abbr), SearchBar, "Filtered" chip with clear, "No matches" state. Unit tests.
- [ ] 10. **Sort (F6)** — pure comparators (Pokémon ID, team, type, position), SortSelect; Position option hidden when no entry has a position. Unit tests.
- [ ] 11. **Deck changes + URL state (F7)** — stay on current entry if still in deck, else first; no rotation on search/sort change; hash URL `#/player/{id}?q=…&sort=…` parse/serialize with fallbacks. Unit tests.

## Finish

- [ ] 12. **Visual design pass** — *blocked on visual direction (Open question 1).* Apply chosen style, check contrast over the logo, focus states, mobile + desktop.
- [ ] 13. **E2E smoke tests** — loads, navigates, logo rotates, search narrows the deck, URL round-trips.
- [ ] 14. **Deploy config** — *blocked on hosting choice (Open question 2).* Bundle-size check (< 150 KB gzipped).
