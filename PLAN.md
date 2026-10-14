# PLAN

Work one item at a time; check it off and commit when done (lint, unit tests, and build passing; e2e + mobile/desktop check for UI items).

## Setup

- [x] 1. **Scaffold** — Vite + React + TS (strict), oxlint, Vitest, Playwright, Papa Parse. `.gitignore`, `.env` / `.env.example` (`VITE_DATA_SOURCE`, `VITE_CSV_URL`), base stylesheet with color/spacing custom properties. Real CSV and logos in `public/`.

## Data layer

- [x] 2. **Entry type + EntrySource** — `Entry` domain type (camelCase, `otherTeams: string[]`, optional `position`, optional supporting stats), `EntrySource` interface, `CsvEntrySource` (column names defined once, row validation, skip + log bad rows), source selection from `import.meta.env`. Unit tests.
- [x] 3. **lib helpers** — `teams.ts` (30 teams: name + color, unknown passes through), formatting (Pokémon display name incl. "Mega X", Dex number hidden above 10000, match %, height), `images.ts` (URL builders + placeholder). Unit tests.
- [x] 4. **useEntries + loading/error states (F4)** — async hook over `EntrySource`; loading view and friendly error view.

## Entry view and navigation

- [x] 5. **EntryCard (F1)** — player, teams, Pokémon, TypeBadge, StatBars on a shared scale, match %. Image fallback to silhouette. Fits 390×844 without scrolling.
- [x] 6. **Navigation (F2, part 1)** — deck index by `PLAYER_ID`, prev/next buttons, ← / → keys, wraparound, position indicator. Default order by Pokémon ID.
- [x] 7. **Swipe (F2, part 2)** — `useSwipe` with pointer events (touch + mouse), threshold snap-back, no skipping/desync on rapid swipes.
- [x] 8. **Rotating logo (F3)** — cumulative rotation constant (20°), 300–400 ms ease-out, instant under `prefers-reduced-motion`. Rotation math unit-tested.
- [x] 8b. **3D deck (F2b)** — *prototype first, tune on a phone, then commit.* Cylinder-style carousel with CSS 3D transforms: focused card pops forward, neighbors angled/dimmed on each side; drag rotates the cylinder and settles on release. Peek cards (artwork + player name) on mobile, scaled full cards on desktop. Flat fallback under `prefers-reduced-motion`. No library; reuses deck navigation and swipe logic.

## Search, sort, URL

- [x] 9. **Search (F5)** — pure matching function (player, Pokémon display name, main + other team name/abbr), SearchBar, "Filtered" chip with clear, "No matches" state. Unit tests.
- [x] 10. **Sort (F6)** — pure comparators (Pokémon ID, team, player/Pokémon BST, position), SortSelect; Position option hidden when no entry has a position. Unit tests.
- [x] 11. **Deck changes + URL state (F7)** — stay on current entry if still in deck, else first; no rotation on search/sort change; hash URL `#/player/{id}?q=…&sort=…` parse/serialize with fallbacks. Unit tests.

## Finish

- [x] 11b. **UI feedback, round 1**
  - [x] Season label in header (`VITE_SEASON`) and season-specific headshots with fallbacks
  - [x] Animated Pokémon sprites (static under reduced motion, fallback to artwork)
  - [x] Team logos next to team names
  - [x] Faded team-color tint on the card
  - [x] Progress slider for quick flipping (F2c)
- [x] 11c. **UI feedback, round 2**
  - [x] Team nicknames and smaller type badges on phones; other teams listed without a prefix
  - [x] Stat breakdowns on radar labels
  - [x] Dark mode (device setting by default, header toggle remembered per browser)
  - [x] "Adjusted" notice for players with manual stat changes (`*_diff` columns)
  - [x] Footer with non-affiliation notice
  - [x] About dialog: how each stat is built (inputs and weights), contact email
  - [x] Sort by player surname, Pokémon name, and match quality; search by Pokémon type
- [ ] 12. **Visual design pass** (match the @nbapokedex posts)
  - [x] Stat colors, butterfly + radar charts with toggle, player/Pokémon series colors, Courier Prime font
  - [x] Graph-paper background, match-quality gauge, surnames in charts (faded player photo and sprite-in-ring deferred)
  - [ ] Final contrast, focus, and mobile/desktop check
- [x] 13. **E2E smoke tests** — loads, navigates, logo rotates, search narrows the deck, URL round-trips. Plus: 3D deck (neighbors visible, inert, reduced-motion flat), tiny filtered decks, alt text, keyboard-only use with visible focus, and an error-free full session.
- [ ] 14. **Deploy config** — *blocked on hosting choice (Open question 2).* Bundle-size check (< 150 KB gzipped).
