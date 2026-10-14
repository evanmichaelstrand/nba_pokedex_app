import { describe, expect, it } from 'vitest'
import { parseEntriesCsv } from '../../src/data/CsvEntrySource'
import type { RealStats } from '../../src/data'
import { formatPercentile, statBreakdown } from '../../src/lib/statBreakdown'

// LeBron James's row from the 2025-26 CSV.
const lebron: RealStats = {
  gamesPlayed: 60,
  totalMinutes: 1989.1,
  pointsPerGame: 20.9,
  fg2Pct: 0.589,
  fg3Pct: 0.317,
  fg3Attempts: 4.1,
  interiorDefFgPct: 0.635,
  perimeterDefFgPct: 0.351,
  avgSpeedMph: 3.62,
  blocks: 0.6,
  rebounds: 6.1,
  assists: 7.2,
  turnovers: 3.0,
  netOffRating: -0.9000000000000057,
  steals: 1.2,
  netDefRating: -3.1999999999999886,
  chargesDrawn: 0,
  looseBallsRecovered: 0.6,
  boxOuts: 0.43,
  percentiles: {
    min: 78.8, ppg: 91.3, fg2Pct: 75.4, interiorDefFgPct: 39.9, blk: 73.8, reb: 82.8, astMinusTov: 95.2,
    netOffRating: 42.2, fg3m: 54.8, perimeterDefFgPct: 51.3, netDefRating: 74.9, stl: 85.7, avgSpeed: 0.5,
    looseBalls: 85.6, charges: 21.6, boxOuts: 55.7,
  },
}

describe('statBreakdown', () => {
  it('HP: games, total minutes, minutes percentile', () => {
    expect(statBreakdown('hp', lebron).lines).toEqual([
      { label: 'Games played', value: '60', percentile: undefined },
      { label: 'Total minutes', value: '1,989', percentile: 78.8 },
    ])
  })

  it('Attack: points per game and 2-point FG%', () => {
    expect(statBreakdown('attack', lebron).lines).toEqual([
      { label: 'Points per game', value: '20.9', percentile: 91.3 },
      { label: '2-point FG%', value: '58.9%', percentile: 75.4 },
    ])
  })

  it('Defense: interior DFG%, rebounds, blocks', () => {
    expect(statBreakdown('defense', lebron).lines.map((l) => [l.label, l.value, l.percentile])).toEqual([
      ['Interior defensive FG%', '63.5%', 39.9],
      ['Rebounds per game', '6.1', 82.8],
      ['Blocks per game', '0.6', 73.8],
    ])
  })

  it('Sp. Attack: assists, turnovers, AST−TOV, derived 3PM, net offensive rating', () => {
    expect(statBreakdown('spAttack', lebron).lines.map((l) => [l.label, l.value, l.percentile])).toEqual([
      ['Assists per game', '7.2', undefined],
      ['Turnovers per game', '3.0', undefined],
      ['AST − TOV', '4.2', 95.2],
      ['3-pointers made per game', '1.3', 54.8],
      ['Net offensive rating', '−0.9', 42.2],
    ])
  })

  it('Sp. Defense: perimeter DFG%, steals, net defensive rating', () => {
    expect(statBreakdown('spDefense', lebron).lines.map((l) => l.value)).toEqual(['35.1%', '1.2', '−3.2'])
  })

  it('Speed: average speed, charges, loose balls, box outs', () => {
    expect(statBreakdown('speed', lebron).lines.map((l) => l.value)).toEqual(['3.62 mph', '0.00', '0.60', '0.43'])
  })

  it('leaves out unavailable values instead of showing 0', () => {
    const sparse: RealStats = { pointsPerGame: 12, percentiles: {} }
    expect(statBreakdown('attack', sparse).lines).toEqual([{ label: 'Points per game', value: '12.0', percentile: undefined }])
    expect(statBreakdown('spAttack', sparse).lines).toEqual([])
  })

  it('has a summary for every stat', () => {
    for (const stat of ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'] as const) {
      expect(statBreakdown(stat, lebron).summary.length).toBeGreaterThan(10)
    }
  })

  it('finds every percentile the shipped CSV provides', () => {
    const files = import.meta.glob<string>('/public/data/*.csv', { query: '?raw', import: 'default', eager: true })
    for (const text of Object.values(files)) {
      const [first] = parseEntriesCsv(text).entries
      const stats = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'] as const
      const withPercentile = stats.flatMap((s) => statBreakdown(s, first.realStats).lines).filter((l) => l.percentile !== undefined)
      expect(withPercentile).toHaveLength(Object.keys(first.realStats.percentiles).length)
    }
  })
})

describe('formatPercentile', () => {
  it.each([
    [91.3, '91st'],
    [2, '2nd'],
    [53, '53rd'],
    [11, '11th'],
    [12.4, '12th'],
    [13, '13th'],
    [100, '100th'],
    [0.2, '1st'],
  ])('%s → %s', (input, expected) => {
    expect(formatPercentile(input)).toBe(expected)
  })
})
