import { useCallback, useState } from 'react'
import type { Entry } from '../data'
import { indexOfId, stepId } from '../lib/deck'

interface Position {
  id: number | null
  /** Net navigation steps so far (next = +1, previous = −1); drives the logo rotation. */
  netSteps: number
}

/**
 * Tracks the current entry by ID (never by index) and moves through the deck with wraparound.
 * When the deck changes (search/sort), the current entry stays if it's still in the deck; otherwise
 * the first entry becomes current. Deck changes never count as steps.
 */
export function useDeckNavigation(deck: readonly Entry[], initialId: number | null = null) {
  const [position, setPosition] = useState<Position>({ id: initialId, netSteps: 0 })
  const [previousDeck, setPreviousDeck] = useState(deck)
  const index = indexOfId(deck, position.id)
  const current = deck[index] as Entry | undefined

  // React's "adjust state when a prop changes" pattern: if the current entry fell out of the new
  // deck, adopt the one now shown, so clearing the search later keeps the user where they are.
  if (deck !== previousDeck) {
    setPreviousDeck(deck)
    if (current && current.id !== position.id) setPosition((p) => ({ ...p, id: current.id }))
  }

  // Functional updates so rapid inputs each step from the latest position.
  const step = useCallback(
    (delta: 1 | -1) =>
      setPosition((p) => ({ id: stepId(deck, p.id, delta), netSteps: p.netSteps + delta })),
    [deck],
  )
  const next = useCallback(() => step(1), [step])
  const previous = useCallback(() => step(-1), [step])

  return { index, current, netSteps: position.netSteps, next, previous }
}
