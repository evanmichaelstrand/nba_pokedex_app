import type { Entry } from '../data'

/** Default deck order: by Pokémon ID ascending, ties by player ID so the order is stable. */
export function sortByPokemonId(entries: readonly Entry[]): Entry[] {
  return [...entries].sort((a, b) => a.pokemon.id - b.pokemon.id || a.id - b.id)
}

/** Index of the entry with this ID, or 0 if it isn't in the deck (or no ID is set). */
export function indexOfId(deck: readonly Entry[], id: number | null): number {
  if (id === null) return 0
  const index = deck.findIndex((e) => e.id === id)
  return index === -1 ? 0 : index
}

/** ID of the entry `delta` steps from `id`, wrapping around both ends. Null for an empty deck. */
export function stepId(deck: readonly Entry[], id: number | null, delta: number): number | null {
  if (deck.length === 0) return null
  const n = deck.length
  const next = (((indexOfId(deck, id) + delta) % n) + n) % n
  return deck[next].id
}
