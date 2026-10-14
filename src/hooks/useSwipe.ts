import { useRef, useState, type PointerEvent } from 'react'
import { swipeDirection } from '../lib/swipe'

interface SwipeOptions {
  onSwipeLeft: () => void
  onSwipeRight: () => void
}

interface DragStart {
  pointerId: number
  x: number
  y: number
  time: number
}

/**
 * Pointer-event swipe detection for touch and mouse. Returns handlers to spread on the swipe target,
 * the live horizontal drag offset, and whether the target should animate back to rest.
 */
export function useSwipe({ onSwipeLeft, onSwipeRight }: SwipeOptions) {
  const start = useRef<DragStart | null>(null)
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  // After a committed swipe the card is replaced, so it should jump to rest rather than slide back.
  const [committed, setCommitted] = useState(false)

  const finish = (event: PointerEvent<HTMLElement>, cancelled: boolean) => {
    const s = start.current
    if (!s || event.pointerId !== s.pointerId) return
    start.current = null
    const direction = cancelled ? null : swipeDirection(event.clientX - s.x, event.clientY - s.y, event.timeStamp - s.time)
    setDragging(false)
    setOffset(0)
    setCommitted(direction !== null)
    if (direction === 'left') onSwipeLeft()
    else if (direction === 'right') onSwipeRight()
  }

  const handlers = {
    onPointerDown(event: PointerEvent<HTMLElement>) {
      if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return
      // Taps on controls inside the card (e.g. the chart toggle) are clicks, not swipes.
      if (event.target instanceof Element && event.target.closest('button, a, input, select, textarea')) return
      start.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp }
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // Synthetic or already-released pointers can't be captured; tracking still works without it.
      }
      setDragging(true)
      setCommitted(false)
    },
    onPointerMove(event: PointerEvent<HTMLElement>) {
      const s = start.current
      if (s && event.pointerId === s.pointerId) setOffset(event.clientX - s.x)
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => finish(event, false),
    onPointerCancel: (event: PointerEvent<HTMLElement>) => finish(event, true),
  }

  return { handlers, offset, dragging, animateToRest: !dragging && !committed }
}
