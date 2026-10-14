import { describe, expect, it } from 'vitest'
import { poseTransform, slotOffsets, slotPose } from '../../src/lib/carousel'

describe('slotOffsets', () => {
  it('renders two neighbors per side for big decks', () => {
    expect(slotOffsets(378)).toEqual([-2, -1, 0, 1, 2])
  })

  it('never repeats an entry in small decks', () => {
    expect(slotOffsets(0)).toEqual([])
    expect(slotOffsets(1)).toEqual([0])
    expect(slotOffsets(2)).toEqual([0, 1])
    expect(slotOffsets(3)).toEqual([-1, 0, 1])
    expect(slotOffsets(4)).toEqual([-1, 0, 1, 2])
  })
})

describe('slotPose', () => {
  it('leaves the focused card flat, forward, and fully opaque', () => {
    expect(slotPose(0)).toMatchObject({ shiftPct: 0, depthPx: -0, angleDeg: 0, opacity: 1 })
    expect(poseTransform(slotPose(0))).toBe('translateX(0%) translateZ(0px) rotateY(0deg)')
  })

  it('is mirror-symmetric', () => {
    for (const p of [0.3, 1, 1.6, 2]) {
      const right = slotPose(p)
      const left = slotPose(-p)
      expect(left.shiftPct).toBeCloseTo(-right.shiftPct)
      expect(left.angleDeg).toBeCloseTo(-right.angleDeg)
      expect(left.depthPx).toBe(right.depthPx)
      expect(left.opacity).toBe(right.opacity)
    }
  })

  it('pushes cards back and dims them with distance', () => {
    const near = slotPose(1)
    const far = slotPose(2)
    expect(near.depthPx).toBeLessThan(0)
    expect(far.depthPx).toBeLessThan(near.depthPx)
    expect(near.opacity).toBeLessThan(1)
    expect(far.opacity).toBe(0)
    expect(slotPose(0).zIndex).toBeGreaterThan(near.zIndex)
  })

  it('moves continuously through the first neighbor', () => {
    const before = slotPose(0.999)
    const after = slotPose(1.001)
    expect(Math.abs(after.shiftPct - before.shiftPct)).toBeLessThan(1)
    expect(Math.abs(after.opacity - before.opacity)).toBeLessThan(0.01)
  })
})
