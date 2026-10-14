import { describe, expect, it } from 'vitest'
import { getTeam } from '../../src/lib/teams'
import { colorDistance, pokemonSeriesColor } from '../../src/lib/seriesColors'

describe('colorDistance', () => {
  it('is zero for identical colors and symmetric', () => {
    expect(colorDistance('#552583', '#552583')).toBe(0)
    expect(colorDistance('#ff0000', '#ffde00')).toBeCloseTo(colorDistance('#ffde00', '#ff0000'))
  })
})

describe('pokemonSeriesColor', () => {
  it('picks yellow against reds and purples', () => {
    expect(pokemonSeriesColor(getTeam('CHI').color)).toBe('#ffde00')
    expect(pokemonSeriesColor(getTeam('LAL').color)).toBe('#ffde00')
  })

  it('picks red against greens and yellows', () => {
    expect(pokemonSeriesColor(getTeam('BOS').color)).toBe('#ff0000')
    expect(pokemonSeriesColor('#fdb927')).toBe('#ff0000')
  })

  it('always returns one of the two series colors', () => {
    for (const abbr of ['ATL', 'BKN', 'DEN', 'GSW', 'MIA', 'OKC', 'SAS', 'XYZ']) {
      expect(['#ff0000', '#ffde00']).toContain(pokemonSeriesColor(getTeam(abbr).color))
    }
  })
})
