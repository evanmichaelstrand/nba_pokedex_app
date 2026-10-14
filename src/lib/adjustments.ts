import type { StatAdjustments } from '../data'
import { STAT_ROWS, type StatRow } from './stats'

export interface AdjustmentLine extends StatRow {
  delta: number
}

/** The stats that were changed by hand, in the usual stat order. */
export function adjustmentLines(adjustments: StatAdjustments): AdjustmentLine[] {
  return STAT_ROWS.filter(({ key }) => adjustments.stats[key] !== 0).map((row) => ({
    ...row,
    delta: adjustments.stats[row.key],
  }))
}

/** A signed change, e.g. "+20", "−5" (true minus sign), "0". */
export function formatDelta(n: number): string {
  if (n > 0) return `+${n}`
  if (n < 0) return `−${Math.abs(n)}`
  return '0'
}
