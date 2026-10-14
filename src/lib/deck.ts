import type { Entry } from '../data'

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

/**
 * Jumping straight to an index (e.g. from the progress slider): the new current ID plus how many
 * steps the jump counts as, so the logo turns 20° per entry passed.
 */
export function jumpTo(deck: readonly Entry[], fromId: number | null, targetIndex: number) {
  if (deck.length === 0) return null
  const target = Math.min(deck.length - 1, Math.max(0, Math.round(targetIndex)))
  return { id: deck[target].id, steps: target - indexOfId(deck, fromId) }
}
