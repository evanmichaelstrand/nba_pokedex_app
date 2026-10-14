/** A drag at least this far (px) counts as a swipe. */
export const SWIPE_DISTANCE_PX = 60
/** A quick flick counts as a swipe if it's at least this fast (px/ms)… */
export const FLICK_VELOCITY = 0.5
/** …and at least this far (px), so taps and jitters never navigate. */
export const FLICK_MIN_DISTANCE_PX = 20

export type SwipeDirection = 'left' | 'right'

/** Decides whether a finished drag was a horizontal swipe. Anything else snaps back. */
export function swipeDirection(dx: number, dy: number, durationMs: number): SwipeDirection | null {
  const distance = Math.abs(dx)
  if (distance <= Math.abs(dy)) return null
  const far = distance >= SWIPE_DISTANCE_PX
  const flick = distance >= FLICK_MIN_DISTANCE_PX && distance / Math.max(durationMs, 1) >= FLICK_VELOCITY
  if (!far && !flick) return null
  return dx < 0 ? 'left' : 'right'
}
