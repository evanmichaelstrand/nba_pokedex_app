import type { RealStats, StatLine } from '../data'

/** One line of a stat's breakdown, ready to display. */
export interface BreakdownLine {
  label: string
  value: string
  /** Percentile among qualifying players (0–100), if the data has one for this input. */
  percentile?: number
}

export interface StatBreakdown {
  /** One sentence on what the stat measures. */
  summary: string
  lines: BreakdownLine[]
}

/** `hustle` gets two decimals: those per-game numbers are small (box outs ≈ 0.4). */
type Format = 'count' | 'decimal' | 'hustle' | 'percent' | 'signed' | 'speed'

interface Metric {
  label: string
  value: (s: RealStats) => number | undefined
  format: Format
  /** Key into RealStats.percentiles (the CSV's pctile_* column, camelCased). */
  percentile?: string
}

const product = (a: number | undefined, b: number | undefined) => (a === undefined || b === undefined ? undefined : a * b)
const difference = (a: number | undefined, b: number | undefined) =>
  a === undefined || b === undefined ? undefined : a - b

/** Which real numbers feed each Pokémon-style stat. */
const BREAKDOWNS: Readonly<Record<keyof StatLine, { summary: string; metrics: Metric[] }>> = {
  hp: {
    summary: 'Durability: how much the player was on the floor.',
    metrics: [
      { label: 'Games played', value: (s) => s.gamesPlayed, format: 'count' },
      { label: 'Total minutes', value: (s) => s.totalMinutes, format: 'count', percentile: 'min' },
    ],
  },
  attack: {
    summary: 'Scoring volume and inside efficiency.',
    metrics: [
      { label: 'Points per game', value: (s) => s.pointsPerGame, format: 'decimal', percentile: 'ppg' },
      { label: '2-point FG%', value: (s) => s.fg2Pct, format: 'percent', percentile: 'fg2Pct' },
    ],
  },
  defense: {
    summary: 'Rim protection and work on the glass.',
    metrics: [
      { label: 'Interior defensive FG%', value: (s) => s.interiorDefFgPct, format: 'percent', percentile: 'interiorDefFgPct' },
      { label: 'Rebounds per game', value: (s) => s.rebounds, format: 'decimal', percentile: 'reb' },
      { label: 'Blocks per game', value: (s) => s.blocks, format: 'decimal', percentile: 'blk' },
    ],
  },
  spAttack: {
    summary: 'Playmaking, outside shooting, and offensive impact.',
    metrics: [
      { label: 'Assists per game', value: (s) => s.assists, format: 'decimal' },
      { label: 'Turnovers per game', value: (s) => s.turnovers, format: 'decimal' },
      { label: 'AST − TOV', value: (s) => difference(s.assists, s.turnovers), format: 'decimal', percentile: 'astMinusTov' },
      // The CSV has 3P% and attempts; makes per game = 3P% × 3PA.
      { label: '3-pointers made per game', value: (s) => product(s.fg3Pct, s.fg3Attempts), format: 'decimal', percentile: 'fg3m' },
      { label: 'Net offensive rating', value: (s) => s.netOffRating, format: 'signed', percentile: 'netOffRating' },
    ],
  },
  spDefense: {
    summary: 'Perimeter defense, steals, and defensive impact.',
    metrics: [
      { label: 'Perimeter defensive FG%', value: (s) => s.perimeterDefFgPct, format: 'percent', percentile: 'perimeterDefFgPct' },
      { label: 'Steals per game', value: (s) => s.steals, format: 'decimal', percentile: 'stl' },
      { label: 'Net defensive rating', value: (s) => s.netDefRating, format: 'signed', percentile: 'netDefRating' },
    ],
  },
  speed: {
    summary: 'Motor: how fast they move and how often they hustle.',
    metrics: [
      { label: 'Average speed', value: (s) => s.avgSpeedMph, format: 'speed', percentile: 'avgSpeed' },
      { label: 'Charges drawn per game', value: (s) => s.chargesDrawn, format: 'hustle', percentile: 'charges' },
      { label: 'Loose balls recovered per game', value: (s) => s.looseBallsRecovered, format: 'hustle', percentile: 'looseBalls' },
      { label: 'Box outs per game', value: (s) => s.boxOuts, format: 'hustle', percentile: 'boxOuts' },
    ],
  },
}

function formatValue(value: number, format: Format): string {
  switch (format) {
    case 'count':
      return Math.round(value).toLocaleString('en-US')
    case 'decimal':
      return value.toFixed(1)
    case 'hustle':
      return value.toFixed(2)
    case 'percent':
      return `${(value * 100).toFixed(1)}%`
    case 'signed': {
      const rounded = Math.round(value * 10) / 10
      // Proper minus sign; no sign on zero.
      return rounded > 0 ? `+${rounded.toFixed(1)}` : rounded < 0 ? `−${Math.abs(rounded).toFixed(1)}` : '0.0'
    }
    case 'speed':
      return `${value.toFixed(2)} mph`
  }
}

/** The stat's real-number inputs for this player. Unavailable values are left out, never shown as 0. */
export function statBreakdown(stat: keyof StatLine, realStats: RealStats): StatBreakdown {
  const { summary, metrics } = BREAKDOWNS[stat]
  const lines: BreakdownLine[] = []
  for (const metric of metrics) {
    const value = metric.value(realStats)
    if (value === undefined || !Number.isFinite(value)) continue
    const percentile = metric.percentile ? realStats.percentiles[metric.percentile] : undefined
    lines.push({ label: metric.label, value: formatValue(value, metric.format), percentile })
  }
  return { summary, lines }
}

/** 91.3 → "91st", 2 → "2nd", 12 → "12th"; clamped to 1st–100th. */
export function formatPercentile(percentile: number): string {
  const n = Math.min(100, Math.max(1, Math.round(percentile)))
  const lastTwo = n % 100
  const suffix = lastTwo >= 11 && lastTwo <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th')
  return `${n}${suffix}`
}
