import { describe, expect, it } from 'vitest'
import type { Entry } from '../../src/data'
import { indexOfId, jumpTo, stepId } from '../../src/lib/deck'

const stats = { hp: 1, attack: 1, defense: 1, spAttack: 1, spDefense: 1, speed: 1 }
const entry = (id: number, pokemonId: number): Entry => ({
  id,
  player: { name: `P${id}`, mainTeam: 'DEN', otherTeams: [], stats, baseStatTotal: 6 },
  pokemon: { id: pokemonId, name: 'x', primaryType: 'water', stats, baseStatTotal: 6 },
  matchPercentage: 0.5,
  realStats: { percentiles: {} },
})

const deck = [entry(10, 1), entry(20, 2), entry(30, 3)]

describe('indexOfId', () => {
  it('finds entries by ID and falls back to the first', () => {
    expect(indexOfId(deck, 20)).toBe(1)
    expect(indexOfId(deck, 99)).toBe(0)
    expect(indexOfId(deck, null)).toBe(0)
  })
})

describe('stepId', () => {
  it('steps forward and back', () => {
    expect(stepId(deck, 10, 1)).toBe(20)
    expect(stepId(deck, 20, -1)).toBe(10)
  })

  it('wraps around both ends', () => {
    expect(stepId(deck, 30, 1)).toBe(10)
    expect(stepId(deck, 10, -1)).toBe(30)
    expect(stepId(deck, 10, -4)).toBe(30)
  })

  it('treats no current ID as the first entry', () => {
    expect(stepId(deck, null, 1)).toBe(20)
  })

  it('handles tiny decks', () => {
    expect(stepId([], 10, 1)).toBeNull()
    expect(stepId([entry(5, 5)], 5, 1)).toBe(5)
  })
})

describe('jumpTo', () => {
  it('returns the target ID and the signed number of steps', () => {
    expect(jumpTo(deck, 10, 2)).toEqual({ id: 30, steps: 2 })
    expect(jumpTo(deck, 30, 0)).toEqual({ id: 10, steps: -2 })
    expect(jumpTo(deck, 20, 1)).toEqual({ id: 20, steps: 0 })
  })

  it('clamps out-of-range targets and handles empty decks', () => {
    expect(jumpTo(deck, 10, 99)).toEqual({ id: 30, steps: 2 })
    expect(jumpTo(deck, 10, -5)).toEqual({ id: 10, steps: 0 })
    expect(jumpTo([], 10, 1)).toBeNull()
  })
})
