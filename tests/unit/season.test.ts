import { describe, expect, it } from 'vitest'
import { playerHeadshotUrls, pokemonSpriteUrls } from '../../src/lib/images'
import { parseSeason } from '../../src/lib/season'

describe('parseSeason', () => {
  it('parses YYYY-YY into a start year and label', () => {
    expect(parseSeason('2025-26')).toEqual({ startYear: 2025, label: '2025–26 Regular Season' })
    expect(parseSeason(' 1999-00 ')).toEqual({ startYear: 1999, label: '1999–00 Regular Season' })
  })

  it('returns null for missing or malformed values', () => {
    expect(parseSeason(undefined)).toBeNull()
    expect(parseSeason('')).toBeNull()
    expect(parseSeason('2025')).toBeNull()
    expect(parseSeason('2025-27')).toBeNull()
  })
})

describe('playerHeadshotUrls', () => {
  it('tries the season photo with each team, then the latest photo', () => {
    expect(playerHeadshotUrls(2544, ['LAL', 'CLE'], 2025)).toEqual([
      'https://cdn.nba.com/headshots/nba/1610612747/2025/1040x760/2544.png',
      'https://cdn.nba.com/headshots/nba/1610612739/2025/1040x760/2544.png',
      'https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png',
    ])
  })

  it('skips unknown teams and uses only the latest photo without a season', () => {
    expect(playerHeadshotUrls(1, ['XYZ'], 2025)).toEqual(['https://cdn.nba.com/headshots/nba/latest/1040x760/1.png'])
    expect(playerHeadshotUrls(1, ['LAL'], null)).toEqual(['https://cdn.nba.com/headshots/nba/latest/1040x760/1.png'])
  })
})

describe('pokemonSpriteUrls', () => {
  it('tries the animated sprite, then official artwork', () => {
    expect(pokemonSpriteUrls(614, true)).toEqual([
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/614.gif',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/614.png',
    ])
  })

  it('uses only the static artwork when motion is off', () => {
    expect(pokemonSpriteUrls(614, false)).toEqual([
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/614.png',
    ])
  })
})
