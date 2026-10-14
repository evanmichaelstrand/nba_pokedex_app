import { useCallback, useState } from 'react'
import type { Entry } from '../data'
import { indexOfId, stepId } from '../lib/deck'

/** Tracks the current entry by ID (never by index) and moves through the deck with wraparound. */
export function useDeckNavigation(deck: readonly Entry[]) {
  const [currentId, setCurrentId] = useState<number | null>(null)
  const index = indexOfId(deck, currentId)

  // Functional updates so rapid presses each step from the latest position.
  const step = useCallback((delta: number) => setCurrentId((id) => stepId(deck, id, delta)), [deck])
  const next = useCallback(() => step(1), [step])
  const previous = useCallback(() => step(-1), [step])

  return { index, current: deck[index] as Entry | undefined, next, previous }
}
