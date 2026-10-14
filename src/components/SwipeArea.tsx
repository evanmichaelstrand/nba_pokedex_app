import type { ReactNode } from 'react'
import { useSwipe } from '../hooks/useSwipe'
import './SwipeArea.css'

interface SwipeAreaProps {
  onSwipeLeft: () => void
  onSwipeRight: () => void
  children: ReactNode
}

/** Makes its children draggable sideways. Children are passed through, so dragging doesn't re-render them. */
export function SwipeArea({ onSwipeLeft, onSwipeRight, children }: SwipeAreaProps) {
  const { handlers, offset, dragging, animateToRest } = useSwipe({ onSwipeLeft, onSwipeRight })
  return (
    <div
      className="swipe-area"
      data-dragging={dragging || undefined}
      data-animate={animateToRest || undefined}
      style={{ transform: offset ? `translateX(${offset}px)` : undefined }}
      {...handlers}
    >
      {children}
    </div>
  )
}
