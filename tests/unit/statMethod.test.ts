import { describe, expect, it } from 'vitest'
import { statSummary } from '../../src/lib/statBreakdown'
import { STAT_METHODS } from '../../src/lib/statMethod'
import { STAT_ROWS } from '../../src/lib/stats'

describe('STAT_METHODS', () => {
  it('describes every stat, with weights that add up to (about) 100%', () => {
    for (const { key } of STAT_ROWS) {
      const total = STAT_METHODS[key].inputs.reduce((sum, input) => sum + input.weight, 0)
      // Thirds are written as 33%.
      expect(total, key).toBeGreaterThanOrEqual(99)
      expect(total, key).toBeLessThanOrEqual(100)
      expect(statSummary(key), key).not.toBe('')
    }
  })
})
