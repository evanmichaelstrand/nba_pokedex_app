import { useCallback, useState } from 'react'
import type { Entry } from '../data'
import { indexOfId, stepId } from '../lib/deck'

interface Position {
  id: number | null
  /** Net navigation steps so far (next = +1, previous = −1); drives the logo rotation. */
  netSteps: number
}

/** Tracks the current entry by ID (never by index) and moves through the deck with wraparound. */
export function useDeckNavigation(deck: readonly Entry[]) {
  const [position, setPosition] = useState<Position>({ id: null, netSteps: 0 })
  const index = indexOfId(deck, position.id)

  // Functional updates so rapid inputs each step from the latest position.
  const step = useCallback(
    (delta: 1 | -1) =>
      setPosition((p) => ({ id: stepId(deck, p.id, delta), netSteps: p.netSteps + delta })),
    [deck],
  )
  const next = useCallback(() => step(1), [step])
  const previous = useCallback(() => step(-1), [step])

  return {
    index,
    current: deck[index] as Entry | undefined,
    netSteps: position.netSteps,
    next,
    previous,
  }
}
