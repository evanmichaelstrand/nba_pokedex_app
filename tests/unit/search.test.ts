import { describe, expect, it } from 'vitest'
import type { Entry } from '../../src/data'
import { filterEntries, matchesQuery, normalizeText } from '../../src/lib/search'

const stats = { hp: 1, attack: 1, defense: 1, spAttack: 1, spDefense: 1, speed: 1 }
const entry = (name: string, mainTeam: string, otherTeams: string[], pokemon: string): Entry => ({
  id: name.length,
  player: { name, mainTeam, otherTeams, stats, baseStatTotal: 6 },
  pokemon: { id: 1, name: pokemon, primaryType: 'water', stats, baseStatTotal: 6 },
  matchPercentage: 0.5,
  realStats: { percentiles: {} },
})

const jokic = entry('Nikola Jokić', 'DEN', [], 'snorlax')
const traded = entry('Traded Guy', 'BOS', ['CLE'], 'tyranitar-mega')

describe('normalizeText', () => {
  it('lowercases, trims, and strips accents', () => {
    expect(normalizeText('  Nikola Jokić ')).toBe('nikola jokic')
    expect(normalizeText('Flabébé')).toBe('flabebe')
  })
})

describe('matchesQuery', () => {
  it('matches player names partially and without accents', () => {
    expect(matchesQuery(jokic, 'jok')).toBe(true)
    expect(matchesQuery(jokic, 'JOKIC')).toBe(true)
    expect(matchesQuery(jokic, 'jokić')).toBe(true)
  })

  it('matches the Pokémon display name, not just the slug', () => {
    expect(matchesQuery(traded, 'mega tyranitar')).toBe(true)
    expect(matchesQuery(jokic, 'snor')).toBe(true)
  })

  it('matches main team by full name or abbreviation', () => {
    expect(matchesQuery(jokic, 'nuggets')).toBe(true)
    expect(matchesQuery(jokic, 'denver')).toBe(true)
    expect(matchesQuery(jokic, 'den')).toBe(true)
  })

  it('matches other teams too', () => {
    expect(matchesQuery(traded, 'cavaliers')).toBe(true)
    expect(matchesQuery(traded, 'cle')).toBe(true)
  })

  it('matches Pokémon types, primary or secondary', () => {
    const dual: Entry = { ...jokic, pokemon: { ...jokic.pokemon, primaryType: 'fighting', secondaryType: 'psychic' } }
    expect(matchesQuery(jokic, 'water')).toBe(true)
    expect(matchesQuery(dual, 'Fighting')).toBe(true)
    expect(matchesQuery(dual, 'psychic')).toBe(true)
    expect(matchesQuery(dual, 'water')).toBe(false)
  })

  it('requires every word to match somewhere', () => {
    expect(matchesQuery(jokic, 'nikola nuggets')).toBe(true)
    expect(matchesQuery(jokic, 'nikola lakers')).toBe(false)
  })

  it('treats an empty or blank query as matching everything', () => {
    expect(matchesQuery(jokic, '')).toBe(true)
    expect(matchesQuery(jokic, '   ')).toBe(true)
  })

  it('rejects non-matches', () => {
    expect(matchesQuery(jokic, 'pikachu')).toBe(false)
  })
})

describe('filterEntries', () => {
  it('keeps matching entries in their original order', () => {
    expect(filterEntries([jokic, traded], 'guy')).toEqual([traded])
    expect(filterEntries([jokic, traded], '')).toEqual([jokic, traded])
  })
})
