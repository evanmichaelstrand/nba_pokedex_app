import { describe, expect, it } from 'vitest'
import { swipeDirection } from '../../src/lib/swipe'

describe('swipeDirection', () => {
  it('recognizes long drags in either direction', () => {
    expect(swipeDirection(-80, 5, 600)).toBe('left')
    expect(swipeDirection(80, -5, 600)).toBe('right')
  })

  it('snaps back on short, slow drags', () => {
    expect(swipeDirection(-40, 0, 600)).toBeNull()
    expect(swipeDirection(0, 0, 50)).toBeNull()
  })

  it('accepts quick flicks below the distance threshold', () => {
    expect(swipeDirection(-30, 0, 40)).toBe('left')
  })

  it('ignores tiny fast jitters', () => {
    expect(swipeDirection(-10, 0, 5)).toBeNull()
  })

  it('ignores mostly-vertical drags', () => {
    expect(swipeDirection(-70, 90, 300)).toBeNull()
  })
})
