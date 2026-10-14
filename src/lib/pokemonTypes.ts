const TYPE_COLORS: Readonly<Record<string, string>> = {
  normal: '#a8a77a',
  fire: '#ee8130',
  water: '#6390f0',
  electric: '#f7d02c',
  grass: '#7ac74c',
  ice: '#96d9d6',
  fighting: '#c22e28',
  poison: '#a33ea1',
  ground: '#e2bf65',
  flying: '#a98ff3',
  psychic: '#f95587',
  bug: '#a6b91a',
  rock: '#b6a136',
  ghost: '#735797',
  dragon: '#6f35fc',
  dark: '#705746',
  steel: '#b7b7ce',
  fairy: '#d685ad',
}

const FALLBACK_TYPE_COLOR = '#9a9a9a'
const DARK_TEXT = '#1a1a1a'
const LIGHT_TEXT = '#ffffff'

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(a: number, b: number): number {
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

/** Picks whichever of dark or white text contrasts more with a #rrggbb background. */
export function readableTextColor(background: string): string {
  const bg = relativeLuminance(background)
  return contrastRatio(bg, relativeLuminance(DARK_TEXT)) >= contrastRatio(bg, 1) ? DARK_TEXT : LIGHT_TEXT
}

/** Badge colors for a Pokémon type; unknown types get a neutral gray. */
export function typeColors(type: string): { background: string; text: string } {
  const background = TYPE_COLORS[type.toLowerCase()] ?? FALLBACK_TYPE_COLOR
  return { background, text: readableTextColor(background) }
}
