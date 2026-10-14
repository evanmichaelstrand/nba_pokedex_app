import type { Entry, StatLine } from '../data'

export const STAT_ROWS: ReadonlyArray<{ key: keyof StatLine; label: string }> = [
  { key: 'hp', label: 'HP' },
  { key: 'attack', label: 'ATK' },
  { key: 'defense', label: 'DEF' },
  { key: 'spAttack', label: 'SP. ATK' },
  { key: 'spDefense', label: 'SP. DEF' },
  { key: 'speed', label: 'SPD' },
]

const SCALE_STEP = 10

/** Shared bar scale: the highest player or Pokémon stat across all entries, rounded up to a multiple of 10. */
export function statScaleMax(entries: readonly Entry[]): number {
  let max = 0
  for (const { player, pokemon } of entries) {
    for (const { key } of STAT_ROWS) max = Math.max(max, player.stats[key], pokemon.stats[key])
  }
  return Math.max(SCALE_STEP, Math.ceil(max / SCALE_STEP) * SCALE_STEP)
}

/** Bar width as a percentage of the scale, clamped to 0–100. */
export function barPercent(value: number, scaleMax: number): number {
  return Math.min(100, Math.max(0, (value / scaleMax) * 100))
}
