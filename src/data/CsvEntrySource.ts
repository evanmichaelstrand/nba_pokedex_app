import Papa from 'papaparse'
import type { Entry, RealStats, StatAdjustments, StatLine } from './entry'
import type { EntrySource } from './EntrySource'

// Column names must match SPEC.md exactly. This file is the only place they appear.

const COLUMNS = {
  playerId: 'PLAYER_ID',
  name: 'name',
  mainTeam: 'main_team',
  otherTeams: 'other_teams',
  position: 'position',
  baseStatTotal: 'base_stat_total',
  pokemonId: 'pokemon_id',
  pokemonName: 'pokemon_name',
  pokemonType1: 'pokemon_type1',
  pokemonType2: 'pokemon_type2',
  pokemonBaseStatTotal: 'pokemon_base_stat_total',
  matchPercentage: 'match_percentage',
} as const

const PLAYER_STAT_COLUMNS: Record<keyof StatLine, string> = {
  hp: 'hp',
  attack: 'attack',
  defense: 'defense',
  spAttack: 'sp_attack',
  spDefense: 'sp_defense',
  speed: 'speed',
}

const POKEMON_STAT_COLUMNS: Record<keyof StatLine, string> = {
  hp: 'pokemon_hp',
  attack: 'pokemon_attack',
  defense: 'pokemon_defense',
  spAttack: 'pokemon_sp_attack',
  spDefense: 'pokemon_sp_defense',
  speed: 'pokemon_speed',
}

/** Optional: manual stat changes (adjusted − original). Missing or blank means no change. */
const ADJUSTMENT_COLUMNS: Record<keyof StatLine, string> = {
  hp: 'hp_diff',
  attack: 'attack_diff',
  defense: 'defense_diff',
  spAttack: 'sp_attack_diff',
  spDefense: 'sp_defense_diff',
  speed: 'speed_diff',
}
const ADJUSTMENT_TOTAL_COLUMN = 'base_stat_total_diff'

const REAL_STAT_COLUMNS: Record<Exclude<keyof RealStats, 'percentiles'>, string> = {
  heightIn: 'height',
  weightLb: 'weight',
  age: 'age',
  gamesPlayed: 'gp',
  minutesPerGame: 'min_pg',
  totalMinutes: 'total_min',
  pointsPerGame: 'ppg',
  trueShootingPct: 'ts_pct',
  fg2Pct: 'fg2_pct',
  fg2Attempts: 'fg2a',
  fg3Pct: 'fg3_pct',
  fg3Attempts: 'fg3a',
  onBallDefFgPct: 'on_ball_def_fg_pct',
  interiorDefFgPct: 'interior_def_fg_pct',
  perimeterDefFgPct: 'perimeter_def_fg_pct',
  avgSpeedMph: 'avg_speed',
  blocks: 'blk',
  rebounds: 'reb',
  assists: 'ast',
  turnovers: 'tov',
  steals: 'stl',
  netOffRating: 'net_off_rating',
  netDefRating: 'net_def_rating',
  chargesDrawn: 'charges_drawn',
  looseBallsRecovered: 'loose_balls_recovered',
  boxOuts: 'box_outs',
}

const PERCENTILE_PREFIX = 'pctile_'

const OPTIONAL_COLUMNS = new Set<string>([COLUMNS.otherTeams, COLUMNS.position, COLUMNS.pokemonType2])

const REQUIRED_COLUMNS = [
  ...Object.values(COLUMNS).filter((c) => !OPTIONAL_COLUMNS.has(c)),
  ...Object.values(PLAYER_STAT_COLUMNS),
  ...Object.values(POKEMON_STAT_COLUMNS),
]

type Row = Record<string, string | undefined>

export interface SkippedRow {
  /** 1-based data row number (header excluded). */
  row: number
  reason: string
}

export interface ParseResult {
  entries: Entry[]
  skipped: SkippedRow[]
}

class RowError extends Error {}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

function requiredNumber(row: Row, column: string): number {
  const n = parseNumber(row[column])
  if (n === undefined) throw new RowError(`missing or invalid ${column}`)
  return n
}

function requiredInteger(row: Row, column: string): number {
  const n = requiredNumber(row, column)
  if (!Number.isInteger(n)) throw new RowError(`${column} is not an integer`)
  return n
}

function requiredText(row: Row, column: string): string {
  const value = row[column]
  if (!value) throw new RowError(`missing ${column}`)
  return value
}

function statLine(row: Row, columns: Record<keyof StatLine, string>): StatLine {
  return {
    hp: requiredNumber(row, columns.hp),
    attack: requiredNumber(row, columns.attack),
    defense: requiredNumber(row, columns.defense),
    spAttack: requiredNumber(row, columns.spAttack),
    spDefense: requiredNumber(row, columns.spDefense),
    speed: requiredNumber(row, columns.speed),
  }
}

function optionalNumber(row: Row, column: string): number {
  const value = row[column]
  if (!value) return 0
  const n = parseNumber(value)
  if (n === undefined) throw new RowError(`invalid ${column}`)
  return n
}

/** The player's manual stat changes, or undefined when there are none. */
function statAdjustments(row: Row): StatAdjustments | undefined {
  const stats: StatLine = {
    hp: optionalNumber(row, ADJUSTMENT_COLUMNS.hp),
    attack: optionalNumber(row, ADJUSTMENT_COLUMNS.attack),
    defense: optionalNumber(row, ADJUSTMENT_COLUMNS.defense),
    spAttack: optionalNumber(row, ADJUSTMENT_COLUMNS.spAttack),
    spDefense: optionalNumber(row, ADJUSTMENT_COLUMNS.spDefense),
    speed: optionalNumber(row, ADJUSTMENT_COLUMNS.speed),
  }
  if (Object.values(stats).every((n) => n === 0)) return undefined
  const sum = Object.values(stats).reduce((a, b) => a + b, 0)
  return { stats, baseStatTotal: row[ADJUSTMENT_TOTAL_COLUMN] ? optionalNumber(row, ADJUSTMENT_TOTAL_COLUMN) : sum }
}

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase())
}

function realStats(row: Row): RealStats {
  const stats: RealStats = { percentiles: {} }
  for (const [key, column] of Object.entries(REAL_STAT_COLUMNS)) {
    const n = parseNumber(row[column])
    if (n !== undefined) stats[key as keyof typeof REAL_STAT_COLUMNS] = n
  }
  for (const [column, value] of Object.entries(row)) {
    if (!column.startsWith(PERCENTILE_PREFIX)) continue
    const n = parseNumber(value)
    if (n !== undefined) stats.percentiles[snakeToCamel(column.slice(PERCENTILE_PREFIX.length))] = n
  }
  return stats
}

function toEntry(row: Row): Entry {
  return {
    id: requiredInteger(row, COLUMNS.playerId),
    player: {
      name: requiredText(row, COLUMNS.name),
      mainTeam: requiredText(row, COLUMNS.mainTeam),
      otherTeams: (row[COLUMNS.otherTeams] ?? '').split(';').map((t) => t.trim()).filter(Boolean),
      position: row[COLUMNS.position] || undefined,
      stats: statLine(row, PLAYER_STAT_COLUMNS),
      baseStatTotal: requiredNumber(row, COLUMNS.baseStatTotal),
      statAdjustments: statAdjustments(row),
    },
    pokemon: {
      id: requiredInteger(row, COLUMNS.pokemonId),
      name: requiredText(row, COLUMNS.pokemonName),
      primaryType: requiredText(row, COLUMNS.pokemonType1),
      secondaryType: row[COLUMNS.pokemonType2] || undefined,
      stats: statLine(row, POKEMON_STAT_COLUMNS),
      baseStatTotal: requiredNumber(row, COLUMNS.pokemonBaseStatTotal),
    },
    matchPercentage: requiredNumber(row, COLUMNS.matchPercentage),
    realStats: realStats(row),
  }
}

/** Parses CSV text into entries. Throws if required columns are missing; skips (and reports) invalid rows. */
export function parseEntriesCsv(text: string): ParseResult {
  const result = Papa.parse<Row>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    transform: (value) => value.trim(),
  })
  const fields = result.meta.fields ?? []
  const missing = REQUIRED_COLUMNS.filter((c) => !fields.includes(c))
  if (missing.length > 0) throw new Error(`CSV is missing required columns: ${missing.join(', ')}`)

  const entries: Entry[] = []
  const skipped: SkippedRow[] = []
  const seenIds = new Set<number>()
  result.data.forEach((row, i) => {
    try {
      const entry = toEntry(row)
      if (seenIds.has(entry.id)) throw new RowError(`duplicate ${COLUMNS.playerId} ${entry.id}`)
      seenIds.add(entry.id)
      entries.push(entry)
    } catch (err) {
      if (!(err instanceof RowError)) throw err
      skipped.push({ row: i + 1, reason: err.message })
    }
  })
  return { entries, skipped }
}

export class CsvEntrySource implements EntrySource {
  private readonly url: string

  constructor(url: string) {
    this.url = url
  }

  async listEntries(): Promise<Entry[]> {
    const response = await fetch(this.url)
    if (!response.ok) throw new Error(`Failed to load ${this.url} (HTTP ${response.status})`)
    const { entries, skipped } = parseEntriesCsv(await response.text())
    for (const s of skipped) console.warn(`Skipping CSV row ${s.row}: ${s.reason}`)
    if (entries.length === 0) throw new Error('The data file contains no valid entries')
    return entries
  }
}
