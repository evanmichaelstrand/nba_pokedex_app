# NBA Pokédex Web App — Spec

## Purpose

A single-page, read-only web app that showcases the **2025-26 NBA Pokédex**: every qualifying NBA player matched to a Pokémon by stat profile. Visitors swipe through entries one at a time, like flipping through a Pokédex.

This app is a front end for an existing pipeline (different directory). It does not run the pipeline, call `nba_api`, or call PokéAPI at runtime.

## Users

- Followers of @nbapokedex (Instagram, TikTok, YouTube Shorts) arriving from a link in bio. **Most will be on a phone**, so mobile is the primary target.
- Recruiters and peers viewing the project from GitHub or LinkedIn on desktop.

## Core workflow

1. Visitor opens the site and sees the first Pokédex entry.
2. Visitor swipes left/right (or uses arrow keys / on-screen arrows) to move between entries.
3. On every move, the background logo rotates and the next entry appears.
4. Visitor can optionally search (by player, Pokémon, or team name) to narrow the deck, and change the sort order (see F5, F6).

That's the whole app. Every decision should serve this loop feeling fast and fun.

## Data

### Source

- A single static CSV: `nba_pokemon_matches_unique_<season>.csv`.
- The app ships with the CSV as a static asset. **The base version has no backend, API, database, or server-side code.** A backend is planned for a later version, so the data layer must be swappable (see "Future backend readiness").
- The file I deploy will differ from the sample in row count and values, but **the column schema is fixed** (below). The app must not hardcode row counts, player names, or teams.

### Schema (one row = one entry)

| Column | Type | Notes |
|---|---|---|
| `PLAYER_ID` | int | NBA.com player ID; unique per row. Used for the headshot URL. |
| `name` | string | Player display name |
| `main_team` | string | Abbreviation of the team the player played the most for, e.g. `DEN`. Always present. |
| `other_teams` | string | Other teams played for this season, semicolon-separated (e.g. `CLE` or `CLE;BOS`). **Usually empty.** |
| `position` | string | **Optional; not yet produced by the pipeline.** Player position (e.g. `G`, `F-C`). The column may be missing entirely or blank; parse it into an optional field on `Entry`. |
| `hp`, `attack`, `defense`, `sp_attack`, `sp_defense`, `speed` | int | Player's Pokémon-style stats (roughly 20–150) |
| `base_stat_total` | int | Sum of the six player stats |
| `pokemon_id` | int | PokéAPI Pokémon ID; unique per row. Usually the National Dex number (1–1025), but alternate forms use PokéAPI's form IDs (e.g. `10049` = Mega Tyranitar). Used for the artwork URL. |
| `pokemon_name` | string | Lowercase PokéAPI-style name, e.g. `starmie`; may contain hyphens (`tyranitar-mega`). Display in title case with hyphens turned into spaces, and `x-mega` shown as "Mega X". |
| `pokemon_type1` | string | Lowercase type, e.g. `water` |
| `pokemon_type2` | string | **Often empty** (single-type Pokémon). Must render cleanly when blank. |
| `pokemon_hp` … `pokemon_speed` | int | Pokémon base stats (roughly 15–175) |
| `pokemon_base_stat_total` | int | Sum of the six Pokémon stats. Some matches use custom stat lines, so always display the CSV values, never look stats up. |
| `match_percentage` | float | 0–1, higher = closer match. Defined as `1 − (sum of the six absolute stat differences) / (average of the two base stat totals)`. Display as a whole-number percent, e.g. `83%`. |

#### Supporting stat columns (after `match_percentage`)

These are the real numbers behind the six player stats. They're in the CSV so the app (and the future backend) can show them, e.g. in an expandable "Real stats" panel. The base version doesn't need to display them; just parse them into the `Entry` type so they're available.

| Column(s) | Notes |
|---|---|
| `height`, `weight`, `age` | Height in inches (display as `6'6"`), weight in lb. `weight` can be blank. |
| `gp`, `min_pg`, `total_min` | Games played, minutes per game, total minutes (HP input) |
| `ppg`, `ts_pct`, `fg2_pct`, `fg2a`, `fg3_pct`, `fg3a` | Scoring and shooting. Percentages are 0–1. |
| `on_ball_def_fg_pct`, `interior_def_fg_pct`, `perimeter_def_fg_pct` | Opponent FG% when defended (0–1, lower is better) |
| `avg_speed` | Average speed, mph |
| `blk`, `reb`, `ast`, `tov`, `stl` | Per-game counting stats |
| `net_off_rating`, `net_def_rating` | On/off net ratings |
| `charges_drawn`, `loose_balls_recovered`, `box_outs` | Hustle stats, per game |
| `pctile_*` (16 columns) | Each input's percentile among qualifying players (0–100), e.g. `pctile_ppg` |

Treat any blank value in these columns as "not available" and hide it rather than showing 0.

### Teams

- Show `main_team` prominently. If `other_teams` is non-empty, split it on `;` and show those teams as secondary (e.g. "Also played for: Cleveland Cavaliers").
- Map abbreviations to full team names and team colors via a static lookup table in the code (all 30 teams).
- An unknown abbreviation should display as-is, not crash.

### Images

- **Season:** the dataset season (e.g. `2025-26`) is configured via `VITE_SEASON` and shown in the header as "2025–26 Regular Season". It also selects season-specific headshots.
- **Player headshot** (first that loads): the season photo with the main team `https://cdn.nba.com/headshots/nba/{TEAM_ID}/{SEASON_START_YEAR}/1040x760/{PLAYER_ID}.png`, then the season photo with each other team, then `https://cdn.nba.com/headshots/nba/latest/1040x760/{PLAYER_ID}.png`. `TEAM_ID` is NBA.com's numeric team ID from the static team table.
- **Pokémon sprite** (first that loads): animated Showdown sprite `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/{pokemon_id}.gif`, then official artwork `…/sprites/pokemon/other/official-artwork/{pokemon_id}.png`. Under `prefers-reduced-motion`, use the static official artwork.
- **Team logos:** `https://cdn.nba.com/logos/nba/{TEAM_ID}/primary/L/logo.svg`, shown next to team names (main and other teams). Unknown teams show no logo.
- All are hot-linked by ID; no images are stored for players, Pokémon, or teams.
- If an image fails to load, show a neutral silhouette placeholder. Never show a broken-image icon.
- **Logo:** my nba_pokedex logo, stored in `public/`: `logo-bw.jpg` (line art) and `logo_color_nobg.png` (full color, transparent background; the source file). The app uses `logo-color-128.png`, a 128px copy of the color logo, for the header and browser-tab icon so first load stays light — regenerate it if the source changes.

## Features & acceptance criteria

### F1 — Pokédex entry view

Each entry fills one screen and shows:

1. **NBA player:** name and headshot
2. **Team(s):** main team's full name with a team-color accent, plus any other teams as secondary text
3. **Pokémon:** display name (title case, hyphens → spaces where appropriate), official artwork, type badge(s), and Dex number (e.g. `#121`; hide the number when `pokemon_id` is above 10000, since those are form IDs)
4. **Stats for both:** the six stats side by side, player vs. Pokémon, plus each base stat total and the match percentage

Done when:
- All fields above render for every row in the CSV, including single-type Pokémon.
- Stat labels are `HP / ATK / DEF / SP. ATK / SP. DEF / SPD`.
- Stats are shown on a **shared scale** (0–max across both datasets, about 180) so the comparison is visually honest, in one of two views the visitor can switch between (the choice persists while navigating and per browser; default **Bars**):
  - **Bars:** a butterfly chart — player bars grow left, Pokémon bars grow right from a center column of stat labels, each stat in its own color, values on the bars, base stat totals on top.
  - **Radar:** both stat lines overlaid on a hexagon (HP at top, then Attack, Defense, Speed, Sp. Def, Sp. Atk clockwise), guide rings every 50, axis labels as stat-colored pills, with a legend.
- Fits in one mobile viewport (390×844) without vertical scrolling.

### F2 — Navigation

- **Swipe** left for next, right for previous (touch and mouse drag).
- **Keyboard:** ← / → arrow keys.
- **On-screen** previous/next buttons for desktop and accessibility.
- **Wraps around:** next on the last entry goes to the first, and vice versa.
- A position indicator, e.g. `12 / 378`. When a search is active it counts within the filtered deck.
- Default entry order: **by Pokémon ID, ascending** (sort in the app; the CSV is ordered by `PLAYER_ID`). Other orders are selectable via F6.

Done when: all three input methods work, a short swipe (under a threshold) snaps back without navigating, and rapid repeated swipes don't skip or desync entries.

### F1b — Card styling

- The card background carries a faded tint of the player's main team color.

### F2c — Progress slider

- A slider under the navigation spans the current (filtered, sorted) deck and tracks the current position.
- Dragging it flips through entries quickly; releasing leaves you on that entry. Arrow keys work on it when focused.
- It's a quick way to flip through, not a replacement for search.
- The logo rotates by the number of entries moved (20° per entry), so scrubbing spins it.

### F2b — 3D deck presentation

- The deck looks like a rotating cylinder: the focused card pops forward at full size; neighboring entries are visible slightly to the left and right, smaller, angled away, and dimmed.
- Dragging rotates the cylinder with the pointer; releasing settles on the nearest card (same swipe threshold as F2).
- **Mobile:** neighbors are lightweight peek cards (Pokémon artwork + player name). **Desktop:** neighbors are scaled-down full cards.
- Under `prefers-reduced-motion`, fall back to the flat single-card view.
- Built with CSS 3D transforms; no carousel library.

Done when: neighbors are visible on both sides at 390×844 and desktop, the focused card still fits without vertical scrolling, and all F2 navigation criteria still pass.

### F3 — Rotating background logo

- The black-and-white line-art logo (`logo-bw.jpg`) sits behind the content, centered, large, and **semi-transparent** (about 8–12% opacity, tune for legibility). The color logo (`logo-color-128.png`) appears small in a header and does not rotate.
- Each navigation **rotates the logo 20° cumulatively**: next = +20°, previous = −20°. It never snaps back to 0.
- Rotation animates smoothly (about 300–400 ms ease-out).
- Under `prefers-reduced-motion`, rotation is instant (no animation).
- Rotation angle lives in a single constant so it's easy to change.

Done when: ten "next" swipes leave the logo at 200°, and foreground content stays readable over the logo.

### F4 — Loading and errors

- Show a loading state while the CSV downloads and parses.
- If the CSV fails to load or is malformed, show a friendly error message instead of a blank page.
- Rows missing required fields are skipped and logged to the console, not rendered half-empty.

### F5 — Search / filter

- One search box. Case-insensitive partial match against: player name, Pokémon display name (e.g. "mega tyranitar"), and team full name or abbreviation for **both** `main_team` and `other_teams`.
- Search narrows the swipe deck; navigation (swipe, keys, buttons, wraparound) works within the filtered deck.
- While a search is active, the UI shows it clearly, e.g. a chip `Filtered: "lakers" ✕` that clears the search.
- If nothing matches, show a "No matches" message with a way to clear the search.

Done when: searching by each of player, Pokémon, main team, and other team narrows the deck correctly; clearing restores the full deck.

### F6 — Sort

- Sort options: **Pokémon ID** (default), **NBA team**, **Player BST**, **Pokémon BST**, **Position**.
  - **Pokémon ID:** ascending.
  - **NBA team:** by `main_team` full name (Atlanta Hawks → Washington Wizards); unknown abbreviations sort by the abbreviation; ties by Pokémon ID.
  - **Player BST / Pokémon BST:** by `base_stat_total` / `pokemon_base_stat_total`, **highest first**, then Pokémon ID.
  - **Position:** by position, then Pokémon ID. **Only shown when at least one entry has a position**, so it appears automatically once the pipeline adds the column.
- Fixed direction per option (BST highest first, others ascending); no reverse toggle.

### F7 — Deck changes and URL state

- When search or sort changes, stay on the current entry if it's still in the new deck; otherwise go to the first entry.
- Search and sort changes **do not** rotate the logo; only navigation does.
- The current entry, search, and sort are reflected in the URL, e.g. `#/player/203932?q=lakers&sort=team`, so a shared link reproduces the view. Defaults are omitted from the URL. Unknown player IDs or sort values fall back to defaults.

Done when: reloading or opening a shared URL restores the same entry, search, and sort.

## Visual design

The look follows the @nbapokedex social posts.

### Stat colors

Each stat has one color, used everywhere that stat appears (chart bars, labels, legends). Define them once as CSS custom properties. Text on a stat color is black or white, whichever meets WCAG AA contrast.

| Stat | Hex |
|---|---|
| HP | `#448f0c` |
| Attack | `#efcc18` |
| Defense | `#e86412` |
| Special Attack | `#14c3f1` |
| Special Defense | `#4a6adf` |
| Speed | `#d51dad` |

### Player vs. Pokémon colors

Where the two sides need their own colors (radar shapes and legend):

- **Player:** the main team's color.
- **Pokémon:** `#ff0000` or `#ffde00`, whichever is easier to tell apart from the team color (larger perceptual color difference). Most teams get yellow; green teams get red.

### Typography and card

- **Font:** Courier Prime (SIL Open Font License), self-hosted from `public/fonts/` with its license file. No runtime font requests.
- **Card:** keeps the faded team-color tint (F1b).

## Future backend readiness

A backend (API + database) is likely in a later version. **Don't build any of it now**, but structure the base version so adding it only means writing a new data source, not touching the UI.

- **One data-source interface.** Components and hooks get data only through a single interface in `src/data/`, for example:
  ```ts
  interface EntrySource {
    listEntries(): Promise<Entry[]>;
  }
  ```
  The base version implements it as `CsvEntrySource`, which fetches and parses the CSV. A future `ApiEntrySource` will implement the same interface by calling the backend. Which one is used is decided in one place (e.g. based on an env variable like `VITE_DATA_SOURCE`).
- **Async everywhere.** Treat loading as async with loading and error states (F4), even though the CSV is local. An API will need the same states.
- **The `Entry` type is the contract.** It is a clean domain object (camelCase fields, `otherTeams` as an array, numbers as numbers), not a mirror of CSV column names. The CSV mapping lives only in `CsvEntrySource`. A future API should return this same shape.
- **Stable IDs.** Use `PLAYER_ID` as the entry's ID everywhere (keys, deep links). Never use array index as identity.
- **No CSV assumptions outside the data layer.** No component should know the data came from a file.
- **Config via env variables.** Anything that will differ between environments (data source, API base URL) goes through `import.meta.env`, with a `.env.example` file documenting it.

Likely future features, for context only (not in scope): multiple seasons, the "true matches" view, search and filtering on the server, and serving data straight from the Python pipeline into a database.

## Tech stack

- **Vite + React + TypeScript** (strict mode)
- **Papa Parse** for CSV parsing in the browser
- **Plain CSS** (CSS modules or one stylesheet with custom properties). No component library.
- Swipe handling: pointer events in a small custom hook, or a lightweight gesture library if it's clearly simpler. No heavy carousel libraries.
- **Vitest** for unit tests (CSV parsing, team parsing, name formatting, rotation math, search matching, sort order, URL state)
- **Playwright** for one or two end-to-end smoke tests (loads, navigates, logo rotates, search narrows the deck)
- **Deploy:** static hosting. Prefer a host that can also run serverless functions later (Vercel or Netlify) so adding a backend doesn't require moving hosts.

## Repo layout

The app lives at the root of this repo. The Python pipeline lives in a separate repo; its output CSV is copied in by hand.

```
public/
  logo-bw.jpg, logo_color_nobg.png (source), logo-color-128.png (header/icon)
  data/nba_pokemon_matches_unique_2526_clean.csv   # copied from the pipeline repo's output; path set by VITE_CSV_URL
src/
  components/   # EntryCard, StatBars, TypeBadge, BackgroundLogo, NavControls, SearchBar, SortSelect
  data/         # Entry type, EntrySource interface, CsvEntrySource (the only code that knows about the CSV)
  hooks/        # useSwipe, useEntries (calls the EntrySource)
  lib/          # team lookup, formatting, image URLs
  App.tsx
tests/
```

## Non-goals (for the base version)

- No backend, database, accounts, writes, or user-generated data (backend comes later; see "Future backend readiness")
- No favorites, and no search/sort beyond what F5–F6 describe
- No multiple seasons or "true matches" view
- No running the Python pipeline from the site
- No analytics or cookies

These may come later; the code should not prevent them, but don't build toward them now.

## Constraints

- Works on current mobile Safari and Chrome, and desktop Chrome, Firefox, and Safari.
- First load is light: the CSV is under 100 KB, and the JS bundle should stay small (target under 150 KB gzipped).
- Accessible: real buttons for navigation, alt text on all images (`"{name} headshot"`, `"{Pokémon} artwork"`), visible focus states, sufficient contrast over the logo.

## Open questions

Decide these before or during planning:

1. **Visual direction:** match the @nbapokedex social posts. Decided so far (see "Visual design"): stat colors, both chart views with a toggle, player/Pokémon colors, Courier Prime, team tint kept. Still open: cream background, match-quality gauge, faded player photo, sprite in the logo ring.
2. **Hosting:** Vercel or Netlify (recommended, since both can host a backend later), or GitHub Pages? Custom domain?
3. **Image hosting:** keep hot-linking NBA and PokéAPI images, or download and serve them myself for reliability?

Resolved: entry order (Pokémon ID by default, user-selectable via F6); deep links (yes, see F7).
