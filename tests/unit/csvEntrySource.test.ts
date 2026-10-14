import { afterEach, describe, expect, it, vi } from 'vitest'
import { CsvEntrySource, parseEntriesCsv } from '../../src/data/CsvEntrySource'
import { createEntrySource } from '../../src/data'

const HEADER = [
  'PLAYER_ID', 'name', 'main_team', 'other_teams',
  'hp', 'attack', 'defense', 'sp_attack', 'sp_defense', 'speed', 'base_stat_total',
  'pokemon_id', 'pokemon_name', 'pokemon_type1', 'pokemon_type2',
  'pokemon_hp', 'pokemon_attack', 'pokemon_defense', 'pokemon_sp_attack', 'pokemon_sp_defense', 'pokemon_speed',
  'pokemon_base_stat_total', 'match_percentage', 'height', 'weight', 'ppg', 'pctile_ppg', 'pctile_fg2_pct',
].join(',')

const ROW_A = '1,Alpha Guy,DEN,,80,90,70,60,50,40,390,121,starmie,water,psychic,60,75,85,100,85,115,520,0.83,78,215,20.5,88.1,40'
const ROW_B = '2,Beta Man,LAL,CLE;BOS,80,90,70,60,50,40,390,10049,tyranitar-mega,rock,,100,164,150,95,120,71,700,0.71,81,,10,,'

const csv = (...rows: string[]) => [HEADER, ...rows].join('\n')

describe('parseEntriesCsv', () => {
  it('maps a row to the Entry domain shape', () => {
    const { entries, skipped } = parseEntriesCsv(csv(ROW_A))
    expect(skipped).toEqual([])
    expect(entries).toEqual([
      {
        id: 1,
        player: {
          name: 'Alpha Guy',
          mainTeam: 'DEN',
          otherTeams: [],
          position: undefined,
          stats: { hp: 80, attack: 90, defense: 70, spAttack: 60, spDefense: 50, speed: 40 },
          baseStatTotal: 390,
        },
        pokemon: {
          id: 121,
          name: 'starmie',
          primaryType: 'water',
          secondaryType: 'psychic',
          stats: { hp: 60, attack: 75, defense: 85, spAttack: 100, spDefense: 85, speed: 115 },
          baseStatTotal: 520,
        },
        matchPercentage: 0.83,
        realStats: { heightIn: 78, weightLb: 215, pointsPerGame: 20.5, percentiles: { ppg: 88.1, fg2Pct: 40 } },
      },
    ])
  })

  it('splits other teams and treats blanks as unavailable', () => {
    const [entry] = parseEntriesCsv(csv(ROW_B)).entries
    expect(entry.player.otherTeams).toEqual(['CLE', 'BOS'])
    expect(entry.pokemon.secondaryType).toBeUndefined()
    expect(entry.realStats.weightLb).toBeUndefined()
    expect(entry.realStats.percentiles).toEqual({})
  })

  it('parses position when the column exists', () => {
    const text = [`${HEADER},position`, `${ROW_A},G-F`, `${ROW_B},`].join('\n')
    const { entries } = parseEntriesCsv(text)
    expect(entries.map((e) => e.player.position)).toEqual(['G-F', undefined])
  })

  it('skips rows with missing or invalid required fields', () => {
    const missingName = ROW_B.replace('Beta Man', '')
    const badStat = ROW_B.replace('2,Beta Man,LAL,CLE;BOS,80', '3,Gamma,LAL,,abc')
    const { entries, skipped } = parseEntriesCsv(csv(ROW_A, missingName, badStat))
    expect(entries.map((e) => e.id)).toEqual([1])
    expect(skipped).toEqual([
      { row: 2, reason: 'missing name' },
      { row: 3, reason: 'missing or invalid hp' },
    ])
  })

  it('skips duplicate player IDs', () => {
    const { entries, skipped } = parseEntriesCsv(csv(ROW_A, ROW_A))
    expect(entries).toHaveLength(1)
    expect(skipped).toEqual([{ row: 2, reason: 'duplicate PLAYER_ID 1' }])
  })

  it('ignores blank lines', () => {
    expect(parseEntriesCsv(csv(ROW_A, '', ROW_B, '')).entries).toHaveLength(2)
  })

  it('throws when required columns are missing', () => {
    expect(() => parseEntriesCsv('<!doctype html><html></html>')).toThrow(/missing required columns/)
  })
})

describe('shipped CSV', () => {
  const files = import.meta.glob<string>('/public/data/*.csv', { query: '?raw', import: 'default', eager: true })

  it.each(Object.entries(files))('%s parses with no skipped rows', (_path, text) => {
    const { entries, skipped } = parseEntriesCsv(text)
    expect(skipped).toEqual([])
    expect(entries.length).toBeGreaterThan(0)
    expect(new Set(entries.map((e) => e.pokemon.id)).size).toBe(entries.length)
  })
})

describe('CsvEntrySource', () => {
  afterEach(() => vi.unstubAllGlobals())

  const stubFetch = (body: string, status = 200) =>
    vi.stubGlobal('fetch', vi.fn(async () => new Response(body, { status })))

  it('fetches and parses entries, logging skipped rows', async () => {
    stubFetch(csv(ROW_A, ROW_B.replace('Beta Man', '')))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const entries = await new CsvEntrySource('data/x.csv').listEntries()
    expect(entries.map((e) => e.id)).toEqual([1])
    expect(warn).toHaveBeenCalledWith('Skipping CSV row 2: missing name')
    warn.mockRestore()
  })

  it('rejects on HTTP errors', async () => {
    stubFetch('not found', 404)
    await expect(new CsvEntrySource('data/x.csv').listEntries()).rejects.toThrow(/HTTP 404/)
  })

  it('rejects when no rows are valid', async () => {
    stubFetch(HEADER)
    await expect(new CsvEntrySource('data/x.csv').listEntries()).rejects.toThrow(/no valid entries/)
  })
})

describe('createEntrySource', () => {
  it('builds a CSV source under the base URL', () => {
    const source = createEntrySource({ BASE_URL: '/', VITE_DATA_SOURCE: 'csv', VITE_CSV_URL: 'data/x.csv' })
    expect(source).toBeInstanceOf(CsvEntrySource)
  })

  it('rejects unknown sources', () => {
    expect(() => createEntrySource({ BASE_URL: '/', VITE_DATA_SOURCE: 'nope', VITE_CSV_URL: '' })).toThrow(/Unknown/)
  })
})

describe('manual stat adjustments', () => {
  const DIFF_HEADER = `${HEADER},hp_diff,attack_diff,defense_diff,sp_attack_diff,sp_defense_diff,speed_diff,base_stat_total_diff`
  const withDiffs = (row: string, diffs: string) => [DIFF_HEADER, `${row},${diffs}`].join('\n')

  it('parses non-zero diffs into statAdjustments', () => {
    const { entries } = parseEntriesCsv(withDiffs(ROW_A, '20,-5,0,0,0,20,35'))
    expect(entries[0].player.statAdjustments).toEqual({
      stats: { hp: 20, attack: -5, defense: 0, spAttack: 0, spDefense: 0, speed: 20 },
      baseStatTotal: 35,
    })
  })

  it('treats all-zero or blank diffs as no adjustments', () => {
    expect(parseEntriesCsv(withDiffs(ROW_A, '0,0,0,0,0,0,0')).entries[0].player.statAdjustments).toBeUndefined()
    expect(parseEntriesCsv(withDiffs(ROW_A, ',,,,,,')).entries[0].player.statAdjustments).toBeUndefined()
  })

  it('works without the diff columns (older files)', () => {
    expect(parseEntriesCsv(csv(ROW_A)).entries[0].player.statAdjustments).toBeUndefined()
  })

  it('sums the six diffs when the total is blank', () => {
    expect(parseEntriesCsv(withDiffs(ROW_A, '10,0,0,0,0,5,')).entries[0].player.statAdjustments?.baseStatTotal).toBe(15)
  })

  it('skips a row with a non-numeric diff', () => {
    const { entries, skipped } = parseEntriesCsv(withDiffs(ROW_A, 'lots,0,0,0,0,0,0'))
    expect(entries).toEqual([])
    expect(skipped[0].reason).toMatch(/hp_diff/)
  })
})
