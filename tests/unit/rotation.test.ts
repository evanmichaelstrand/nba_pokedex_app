import { describe, expect, it } from 'vitest'
import { LOGO_ROTATION_STEP_DEG, logoRotation } from '../../src/lib/rotation'

describe('logoRotation', () => {
  it('defaults to 20° per step', () => {
    expect(LOGO_ROTATION_STEP_DEG).toBe(20)
  })

  it('ten "next" steps leave the logo at 200°', () => {
    expect(logoRotation(10)).toBe(200)
  })

  it('is cumulative and never snaps back past a full turn', () => {
    expect(logoRotation(18)).toBe(360)
    expect(logoRotation(19)).toBe(380)
  })

  it('goes negative for "previous"', () => {
    expect(logoRotation(-1)).toBe(-20)
    expect(logoRotation(0)).toBe(0)
  })

  it('respects a custom step', () => {
    expect(logoRotation(3, 15)).toBe(45)
  })
})
