import type { Entry } from '../data'
import { formatPokemonName, shortPlayerName } from './format'
import { getTeam } from './teams'

export type SortKey =
  | 'pokemonId'
  | 'playerName'
  | 'pokemonName'
  | 'team'
  | 'match'
  | 'playerBst'
  | 'pokemonBst'
  | 'position'

export const DEFAULT_SORT: SortKey = 'pokemonId'

export const SORT_LABELS: Readonly<Record<SortKey, string>> = {
  pokemonId: 'Pokémon ID',
  playerName: 'Player name',
  pokemonName: 'Pokémon name',
  team: 'NBA team',
  match: 'Match quality',
  playerBst: 'Player BST',
  pokemonBst: 'Pokémon BST',
  position: 'Position',
}

const SORT_KEYS = Object.keys(SORT_LABELS) as SortKey[]

export function isSortKey(value: string): value is SortKey {
  return (SORT_KEYS as string[]).includes(value)
}

const text = (a: string, b: string) => a.localeCompare(b, 'en', { sensitivity: 'base' })

/** Final tie-breakers shared by every order: Pokémon ID, then player ID (so order is fully stable). */
const byPokemonId = (a: Entry, b: Entry) => a.pokemon.id - b.pokemon.id || a.id - b.id

/** Missing values sort last. */
function optionalText(a: string | undefined, b: string | undefined): number {
  if (a === b) return 0
  if (a === undefined) return 1
  if (b === undefined) return -1
  return text(a, b)
}

const COMPARATORS: Readonly<Record<SortKey, (a: Entry, b: Entry) => number>> = {
  pokemonId: byPokemonId,
  // By surname (as shown in the charts), then full name.
  playerName: (a, b) =>
    text(shortPlayerName(a.player.name), shortPlayerName(b.player.name)) ||
    text(a.player.name, b.player.name) ||
    byPokemonId(a, b),
  // By display name, so "Mega Tyranitar" sorts under M.
  pokemonName: (a, b) => text(formatPokemonName(a.pokemon.name), formatPokemonName(b.pokemon.name)) || byPokemonId(a, b),
  // By full team name; unknown abbreviations fall back to the abbreviation itself.
  team: (a, b) => text(getTeam(a.player.mainTeam).name, getTeam(b.player.mainTeam).name) || byPokemonId(a, b),
  // Match quality and base stat totals sort highest first.
  match: (a, b) => b.matchPercentage - a.matchPercentage || byPokemonId(a, b),
  playerBst: (a, b) => b.player.baseStatTotal - a.player.baseStatTotal || byPokemonId(a, b),
  pokemonBst: (a, b) => b.pokemon.baseStatTotal - a.pokemon.baseStatTotal || byPokemonId(a, b),
  position: (a, b) => optionalText(a.player.position, b.player.position) || byPokemonId(a, b),
}

export function sortEntries(entries: readonly Entry[], key: SortKey): Entry[] {
  return [...entries].sort(COMPARATORS[key])
}

/** Sort options worth offering for this data. Position only appears once some entry has one. */
export function availableSortKeys(entries: readonly Entry[]): SortKey[] {
  const hasPosition = entries.some((e) => e.player.position)
  return SORT_KEYS.filter((key) => key !== 'position' || hasPosition)
}
