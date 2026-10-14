import { describe, expect, it } from 'vitest'
import { gaugeAngle } from '../../src/lib/gauge'

describe('gaugeAngle', () => {
  it('maps 0–100% onto a left-to-right semicircle', () => {
    expect(gaugeAngle(0)).toBe(-90)
    expect(gaugeAngle(0.5)).toBe(0)
    expect(gaugeAngle(1)).toBe(90)
  })

  it('points up and to the right for a strong match', () => {
    expect(gaugeAngle(0.87)).toBeCloseTo(66.6)
  })

  it('clamps out-of-range values', () => {
    expect(gaugeAngle(-0.2)).toBe(-90)
    expect(gaugeAngle(1.3)).toBe(90)
  })
})
