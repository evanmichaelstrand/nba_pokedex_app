import type { Entry } from '../data'
import { useElementWidth } from '../hooks/useElementWidth'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useSwipe } from '../hooks/useSwipe'
import { COMPACT_STEP_SHIFT, poseTransform, slotOffsets, slotPose, STEP_SHIFT } from '../lib/carousel'
import { EntryCard } from './EntryCard'
import { PeekCard } from './PeekCard'
import './Deck.css'

interface DeckProps {
  deck: readonly Entry[]
  index: number
  /** Net navigation steps; gives each slot a stable key so cards glide between positions. */
  netSteps: number
  statScaleMax: number
  /** Hold off on loading images (while scrubbing). */
  deferImages: boolean
  onNext: () => void
  onPrevious: () => void
}

const mod = (n: number, m: number) => ((n % m) + m) % m

/** The swipeable 3D deck: focused card in front, neighbors angled away on a cylinder. */
export function Deck({ deck, index, netSteps, statScaleMax, deferImages, onNext, onPrevious }: DeckProps) {
  const wide = useMediaQuery('(min-width: 640px)')
  const flat = useMediaQuery('(prefers-reduced-motion: reduce)')
  // Swipe left = next, swipe right = previous.
  const { handlers, offset, dragging } = useSwipe({ onSwipeLeft: onNext, onSwipeRight: onPrevious })
  const [measureRef, cardWidth] = useElementWidth<HTMLDivElement>()
  const dragFraction = cardWidth > 0 && !flat ? offset / cardWidth : 0
  const offsets = flat ? [0] : slotOffsets(deck.length)

  return (
    <div className="deck" data-dragging={dragging || undefined} data-flat={flat || undefined} {...handlers}>
      {offsets.map((o) => {
        const entry = deck[mod(index + o, deck.length)]
        const focused = o === 0
        const pose = slotPose(o + dragFraction, wide ? STEP_SHIFT : COMPACT_STEP_SHIFT)
        return (
          <div
            // Keyed by virtual position, not entry, so wraparound in tiny decks never sweeps a card across.
            key={netSteps + o}
            ref={focused ? measureRef : undefined}
            className="deck-slot"
            data-offset={o}
            aria-hidden={!focused || undefined}
            inert={!focused || undefined}
            style={flat ? undefined : { transform: poseTransform(pose), opacity: pose.opacity, zIndex: pose.zIndex }}
          >
            {focused || wide ? (
              <EntryCard entry={entry} statScaleMax={statScaleMax} deferImages={deferImages} />
            ) : (
              <PeekCard entry={entry} side={o < 0 ? 'left' : 'right'} deferImages={deferImages} />
            )}
          </div>
        )
      })}
    </div>
  )
}
