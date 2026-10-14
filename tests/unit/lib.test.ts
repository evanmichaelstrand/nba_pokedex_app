import { describe, expect, it } from 'vitest'
import { parseEntriesCsv } from '../../src/data/CsvEntrySource'
import { getTeam } from '../../src/lib/teams'
import {
  formatDexNumber,
  formatHeight,
  formatMatchPercent,
  formatPokemonName,
  formatTypeName,
  shortPlayerName,
} from '../../src/lib/format'
import { PLACEHOLDER_IMAGE_URL, pokemonArtworkUrl } from '../../src/lib/images'

describe('getTeam', () => {
  it('looks up known teams case-insensitively', () => {
    expect(getTeam('DEN')).toEqual({ abbreviation: 'DEN', name: 'Denver Nuggets', color: '#0e2240', id: 1610612743 })
    expect(getTeam('lal').name).toBe('Los Angeles Lakers')
  })

  it('passes unknown abbreviations through', () => {
    const team = getTeam('XYZ')
    expect(team.abbreviation).toBe('XYZ')
    expect(team.name).toBe('XYZ')
    expect(team.color).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('knows every team in the shipped CSV', () => {
    const files = import.meta.glob<string>('/public/data/*.csv', { query: '?raw', import: 'default', eager: true })
    for (const text of Object.values(files)) {
      const abbrs = parseEntriesCsv(text).entries.flatMap((e) => [e.player.mainTeam, ...e.player.otherTeams])
      for (const abbr of abbrs) expect(getTeam(abbr).name, abbr).not.toBe(abbr)
    }
  })
})

describe('formatPokemonName', () => {
  it.each([
    ['starmie', 'Starmie'],
    ['tyranitar-mega', 'Mega Tyranitar'],
    ['charizard-mega-x', 'Mega Charizard X'],
    ['groudon-primal', 'Primal Groudon'],
    ['raichu-alola', 'Alolan Raichu'],
    ['mr-mime-galar', 'Galarian Mr. Mime'],
    ['mr-mime', 'Mr. Mime'],
    ['ho-oh', 'Ho-Oh'],
    ['tapu-koko', 'Tapu Koko'],
    ['giratina-origin', 'Giratina Origin'],
    ['giratina-altered', 'Giratina'],
    ['wormadam-plant', 'Wormadam'],
    ['minior-red-meteor', 'Minior'],
    ['pyroar-male', 'Pyroar'],
    ['meowstic-female', 'Meowstic Female'],
    ['porygon-z', 'Porygon-Z'],
    ['jangmo-o', 'Jangmo-o'],
    ['farfetchd', 'Farfetch’d'],
    ['flabebe', 'Flabébé'],
    ['nidoran-f', 'Nidoran♀'],
  ])('%s → %s', (slug, expected) => {
    expect(formatPokemonName(slug)).toBe(expected)
  })
})

describe('formatDexNumber', () => {
  it('shows National Dex numbers and hides form IDs', () => {
    expect(formatDexNumber(121)).toBe('#121')
    expect(formatDexNumber(1025)).toBe('#1025')
    expect(formatDexNumber(10049)).toBeNull()
  })
})

describe('other formatters', () => {
  it('formats types, match percent, and height', () => {
    expect(formatTypeName('water')).toBe('Water')
    expect(formatMatchPercent(0.8291)).toBe('83%')
    expect(formatMatchPercent(0.825)).toBe('83%')
    expect(formatMatchPercent(1)).toBe('100%')
    expect(formatHeight(78)).toBe(`6'6"`)
    expect(formatHeight(84)).toBe(`7'0"`)
  })
})

describe('image URLs', () => {
  it('builds URLs by ID', () => {
    expect(pokemonArtworkUrl(10049)).toMatch(/official-artwork\/10049\.png$/)
  })

  it('has an inline placeholder', () => {
    expect(PLACEHOLDER_IMAGE_URL).toMatch(/^data:image\/svg\+xml,/)
  })
})

describe('shortPlayerName', () => {
  it.each([
    ['Austin Reaves', 'Reaves'],
    ['Jaren Jackson Jr.', 'Jackson'],
    ['Jimmy Butler III', 'Butler'],
    ['Gary Payton II', 'Payton'],
    ['Tristan da Silva', 'da Silva'],
    ['Shai Gilgeous-Alexander', 'Gilgeous-Alexander'],
    ['Nikola Jokić', 'Jokić'],
    ['Nenê', 'Nenê'],
    ['  LeBron   James ', 'James'],
  ])('%s → %s', (name, expected) => {
    expect(shortPlayerName(name)).toBe(expected)
  })
})
