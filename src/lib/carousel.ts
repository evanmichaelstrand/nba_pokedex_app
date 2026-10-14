/** How many neighbor cards to render on each side of the focused card. */
export const MAX_SIDE_SLOTS = 2

// Tunables for the cylinder look.
/** Default horizontal distance between neighboring cards, as a fraction of card width. */
export const STEP_SHIFT = 1
/** Tighter spacing for phones, so neighbors peek into the narrow side gutters. */
export const COMPACT_STEP_SHIFT = 0.9
/** Extra horizontal distance per step beyond the first neighbor (cards bunch up toward the back). */
const OUTER_SHIFT = 0.35
/** How far back (px) each step pushes a card. */
const STEP_DEPTH_PX = 160
/** How much each step turns a card away from the viewer. */
const STEP_ANGLE_DEG = 38
/** Opacity lost by the first neighbor. */
const NEIGHBOR_DIM = 0.35

export interface SlotPose {
  shiftPct: number
  depthPx: number
  angleDeg: number
  opacity: number
  zIndex: number
}

/** Offsets (relative to the focused card) worth rendering for a deck of this size, without repeating entries. */
export function slotOffsets(deckSize: number, maxSide: number = MAX_SIDE_SLOTS): number[] {
  if (deckSize <= 0) return []
  const left = Math.min(maxSide, Math.floor((deckSize - 1) / 2))
  const right = Math.min(maxSide, deckSize - 1 - left)
  const offsets: number[] = []
  for (let i = 0; i <= left + right; i++) offsets.push(i - left)
  return offsets
}

/**
 * Where a card sits on the cylinder. `position` is its distance from focus in cards:
 * 0 = focused, ±1 = immediate neighbors; fractional while dragging.
 */
export function slotPose(position: number, stepShift: number = STEP_SHIFT): SlotPose {
  const a = Math.abs(position)
  const sign = position < 0 ? -1 : 1
  const shift = a <= 1 ? a * stepShift : stepShift + (a - 1) * OUTER_SHIFT
  const opacity = a <= 1 ? 1 - NEIGHBOR_DIM * a : Math.max(0, (1 - NEIGHBOR_DIM) * (2 - a))
  return {
    shiftPct: a === 0 ? 0 : sign * shift * 100,
    depthPx: -a * STEP_DEPTH_PX,
    // Convex cylinder: cards on the right turn their right edge away, and vice versa.
    angleDeg: a === 0 ? 0 : sign * Math.min(a, 1.5) * STEP_ANGLE_DEG,
    opacity,
    zIndex: 100 - Math.round(a * 10),
  }
}

export function poseTransform(pose: SlotPose): string {
  return `translateX(${pose.shiftPct}%) translateZ(${pose.depthPx}px) rotateY(${pose.angleDeg}deg)`
}
