import { describe, expect, it } from 'vitest'
import { adjustmentLines, formatDelta } from '../../src/lib/adjustments'

describe('adjustmentLines', () => {
  it('lists only the changed stats, in stat order', () => {
    const lines = adjustmentLines({
      stats: { hp: 20, attack: -5, defense: 0, spAttack: 0, spDefense: 0, speed: 20 },
      baseStatTotal: 35,
    })
    expect(lines.map(({ label, delta }) => [label, delta])).toEqual([
      ['HP', 20],
      ['ATK', -5],
      ['SPD', 20],
    ])
  })
})

describe('formatDelta', () => {
  it.each([
    [20, '+20'],
    [-5, '−5'],
    [0, '0'],
  ])('%d → %s', (n, expected) => {
    expect(formatDelta(n)).toBe(expected)
  })
})
