import { describe, expect, it } from 'vitest'
import type { Entry, StatLine } from '../../src/data'
import { barPercent, STAT_ROWS, statScaleMax } from '../../src/lib/stats'
import { readableTextColor, typeColors } from '../../src/lib/pokemonTypes'

const stats = (n: number): StatLine => ({ hp: n, attack: n, defense: n, spAttack: n, spDefense: n, speed: n })

const entry = (playerStat: number, pokemonStat: number): Entry => ({
  id: playerStat,
  player: { name: 'P', mainTeam: 'DEN', otherTeams: [], stats: stats(playerStat), baseStatTotal: 0 },
  pokemon: { id: 1, name: 'x', primaryType: 'water', stats: stats(pokemonStat), baseStatTotal: 0 },
  matchPercentage: 0.5,
  realStats: { percentiles: {} },
})

describe('STAT_ROWS', () => {
  it('uses the spec labels in order', () => {
    expect(STAT_ROWS.map((r) => r.label)).toEqual(['HP', 'ATK', 'DEF', 'SP. ATK', 'SP. DEF', 'SPD'])
  })
})

describe('statScaleMax', () => {
  it('rounds the max across both players and Pokémon up to a multiple of 10', () => {
    expect(statScaleMax([entry(150, 90), entry(60, 173)])).toBe(180)
    expect(statScaleMax([entry(170, 20)])).toBe(170)
  })

  it('has a sensible floor for empty input', () => {
    expect(statScaleMax([])).toBe(10)
  })
})

describe('barPercent', () => {
  it('scales and clamps', () => {
    expect(barPercent(90, 180)).toBe(50)
    expect(barPercent(200, 180)).toBe(100)
    expect(barPercent(-5, 180)).toBe(0)
  })
})

describe('type colors', () => {
  it('uses dark text on light backgrounds and white on dark', () => {
    expect(readableTextColor('#f7d02c')).toBe('#1a1a1a')
    expect(readableTextColor('#6f35fc')).toBe('#ffffff')
  })

  it('falls back for unknown types', () => {
    expect(typeColors('shadow').background).toMatch(/^#[0-9a-f]{6}$/)
    expect(typeColors('Water').background).toBe('#6390f0')
  })
})
