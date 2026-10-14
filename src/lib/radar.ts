import type { StatLine } from '../data'
import { STAT_ROWS, type StatRow } from './stats'

/** Clockwise from the top, as in the @nbapokedex posts: HP, Attack, Defense, Speed, Sp. Def, Sp. Atk. */
const RADAR_KEYS: ReadonlyArray<keyof StatLine> = ['hp', 'attack', 'defense', 'speed', 'spDefense', 'spAttack']

export const RADAR_AXES: readonly StatRow[] = RADAR_KEYS.map((key) => STAT_ROWS.find((row) => row.key === key)!)

export interface Point {
  x: number
  y: number
}

/** Point on axis `axis` at distance `r` from the center (0,0), with axis 0 pointing straight up. */
export function axisPoint(axis: number, r: number): Point {
  const angle = (axis / RADAR_AXES.length) * 2 * Math.PI - Math.PI / 2
  const round = (n: number) => Math.round(n * 100) / 100
  return { x: round(r * Math.cos(angle)), y: round(r * Math.sin(angle)) }
}

/** SVG `points` for a stat line on a radar of the given radius, scaled to scaleMax and clamped to it. */
export function radarPolygon(stats: StatLine, scaleMax: number, radius: number): string {
  return RADAR_AXES.map(({ key }, axis) => {
    const r = (Math.min(Math.max(stats[key], 0), scaleMax) / scaleMax) * radius
    const { x, y } = axisPoint(axis, r)
    return `${x},${y}`
  }).join(' ')
}

/** SVG `points` for a regular hexagon ring at radius r. */
export function ringPolygon(r: number): string {
  return RADAR_AXES.map((_, axis) => {
    const { x, y } = axisPoint(axis, r)
    return `${x},${y}`
  }).join(' ')
}
