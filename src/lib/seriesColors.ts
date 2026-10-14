/** The two candidate Pokémon series colors; each card uses whichever stands apart more from the team color. */
export const POKEMON_SERIES_COLORS = ['#ff0000', '#ffde00'] as const

type Lab = [number, number, number]

function hexToLab(hex: string): Lab {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  // sRGB → XYZ (D65), normalized to the white point.
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27) * t / 116 + 16 / 116)
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]
}

/** Perceptual distance between two #rrggbb colors (CIE76 ΔE; bigger = easier to tell apart). */
export function colorDistance(a: string, b: string): number {
  const [l1, a1, b1] = hexToLab(a)
  const [l2, a2, b2] = hexToLab(b)
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2)
}

/** The Pokémon series color that's easiest to tell apart from the player's team color. */
export function pokemonSeriesColor(teamColor: string): string {
  const [red, yellow] = POKEMON_SERIES_COLORS
  return colorDistance(teamColor, red) >= colorDistance(teamColor, yellow) ? red : yellow
}
