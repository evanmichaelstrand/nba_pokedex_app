import type { Entry } from '../data'
import { getTeam } from './teams'

export type SortKey = 'pokemonId' | 'team' | 'playerBst' | 'pokemonBst' | 'position'

export const DEFAULT_SORT: SortKey = 'pokemonId'

export const SORT_LABELS: Readonly<Record<SortKey, string>> = {
  pokemonId: 'Pokémon ID',
  team: 'NBA team',
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
  // By full team name; unknown abbreviations fall back to the abbreviation itself.
  team: (a, b) => text(getTeam(a.player.mainTeam).name, getTeam(b.player.mainTeam).name) || byPokemonId(a, b),
  // Base stat totals sort highest first.
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
