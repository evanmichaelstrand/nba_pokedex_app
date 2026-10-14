import { describe, expect, it } from 'vitest'
import type { Entry } from '../../src/data'
import { availableSortKeys, isSortKey, sortEntries } from '../../src/lib/sort'

const stats = { hp: 1, attack: 1, defense: 1, spAttack: 1, spDefense: 1, speed: 1 }

interface Spec {
  id: number
  pokemonId: number
  team?: string
  types?: [string, string?]
  position?: string
}

const entry = ({ id, pokemonId, team = 'DEN', types = ['water'], position }: Spec): Entry => ({
  id,
  player: { name: `P${id}`, mainTeam: team, otherTeams: [], position, stats, baseStatTotal: 6 },
  pokemon: { id: pokemonId, name: 'x', primaryType: types[0], secondaryType: types[1], stats, baseStatTotal: 6 },
  matchPercentage: 0.5,
  realStats: { percentiles: {} },
})

const ids = (entries: Entry[]) => entries.map((e) => e.id)

describe('sortEntries', () => {
  it('sorts by Pokémon ID by default, with player ID as a stable tie-break', () => {
    const input = [entry({ id: 1, pokemonId: 300 }), entry({ id: 3, pokemonId: 5 }), entry({ id: 2, pokemonId: 5 })]
    expect(ids(sortEntries(input, 'pokemonId'))).toEqual([2, 3, 1])
    expect(ids(input)).toEqual([1, 3, 2])
  })

  it('sorts by full team name, then Pokémon ID', () => {
    const input = [
      entry({ id: 1, pokemonId: 50, team: 'LAL' }), // Los Angeles Lakers
      entry({ id: 2, pokemonId: 10, team: 'LAL' }),
      entry({ id: 3, pokemonId: 99, team: 'BOS' }), // Boston Celtics
      entry({ id: 4, pokemonId: 1, team: 'LAC' }), // LA Clippers
    ]
    expect(ids(sortEntries(input, 'team'))).toEqual([3, 4, 2, 1])
  })

  it('sorts unknown teams by their abbreviation', () => {
    const input = [entry({ id: 1, pokemonId: 1, team: 'ZZZ' }), entry({ id: 2, pokemonId: 2, team: 'AAA' })]
    expect(ids(sortEntries(input, 'team'))).toEqual([2, 1])
  })

  it('sorts by primary type, then secondary (single-type first), then Pokémon ID', () => {
    const input = [
      entry({ id: 1, pokemonId: 9, types: ['water', 'ice'] }),
      entry({ id: 2, pokemonId: 8, types: ['water'] }),
      entry({ id: 3, pokemonId: 7, types: ['fire', 'flying'] }),
      entry({ id: 4, pokemonId: 6, types: ['water', 'dark'] }),
      entry({ id: 5, pokemonId: 1, types: ['water'] }),
    ]
    expect(ids(sortEntries(input, 'type'))).toEqual([3, 5, 2, 4, 1])
  })

  it('sorts by position with missing positions last', () => {
    const input = [
      entry({ id: 1, pokemonId: 1 }),
      entry({ id: 2, pokemonId: 2, position: 'G' }),
      entry({ id: 3, pokemonId: 3, position: 'C' }),
      entry({ id: 4, pokemonId: 4, position: 'G-F' }),
    ]
    expect(ids(sortEntries(input, 'position'))).toEqual([3, 2, 4, 1])
  })
})

describe('availableSortKeys', () => {
  it('hides Position until some entry has one', () => {
    expect(availableSortKeys([entry({ id: 1, pokemonId: 1 })])).toEqual(['pokemonId', 'team', 'type'])
    expect(availableSortKeys([entry({ id: 1, pokemonId: 1, position: 'G' })])).toContain('position')
  })
})

describe('isSortKey', () => {
  it('accepts only known keys', () => {
    expect(isSortKey('team')).toBe(true)
    expect(isSortKey('bogus')).toBe(false)
  })
})
