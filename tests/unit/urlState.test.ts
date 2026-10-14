import { describe, expect, it } from 'vitest'
import { buildHash, parseHash } from '../../src/lib/urlState'

const defaults = { playerId: null, query: '', sort: 'pokemonId' }

describe('parseHash', () => {
  it('reads player, search, and sort', () => {
    expect(parseHash('#/player/203932?q=lakers&sort=team')).toEqual({
      playerId: 203932,
      query: 'lakers',
      sort: 'team',
    })
  })

  it('falls back to defaults for an empty or unrelated hash', () => {
    expect(parseHash('')).toEqual(defaults)
    expect(parseHash('#')).toEqual(defaults)
    expect(parseHash('#/somewhere/else')).toEqual(defaults)
  })

  it('accepts search and sort without a player', () => {
    expect(parseHash('#/?q=mega')).toEqual({ ...defaults, query: 'mega' })
    expect(parseHash('#?sort=type')).toEqual({ ...defaults, sort: 'type' })
  })

  it('tolerates a trailing slash and a missing leading slash', () => {
    expect(parseHash('#/player/5/').playerId).toBe(5)
    expect(parseHash('#player/5').playerId).toBe(5)
  })

  it('ignores invalid player IDs and unknown sorts', () => {
    expect(parseHash('#/player/abc').playerId).toBeNull()
    expect(parseHash('#/player/-3').playerId).toBeNull()
    expect(parseHash('#/player/1?sort=bogus').sort).toBe('pokemonId')
  })

  it('decodes encoded search text', () => {
    expect(parseHash('#/?q=nikola+joki%C4%87').query).toBe('nikola jokić')
  })
})

describe('buildHash', () => {
  it('omits defaults', () => {
    expect(buildHash({ playerId: 203932, query: '', sort: 'pokemonId' })).toBe('#/player/203932')
    expect(buildHash({ playerId: null, query: '   ', sort: 'pokemonId' })).toBe('#/')
  })

  it('includes search and non-default sort', () => {
    expect(buildHash({ playerId: 1, query: 'lakers', sort: 'team' })).toBe('#/player/1?q=lakers&sort=team')
  })

  it('round-trips through parseHash', () => {
    const view = { playerId: 42, query: 'Nikola Jokić & co', sort: 'type' as const }
    expect(parseHash(buildHash(view))).toEqual(view)
  })
})
