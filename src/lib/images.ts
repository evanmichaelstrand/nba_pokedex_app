export function playerHeadshotUrl(playerId: number): string {
  return `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`
}

export function pokemonArtworkUrl(pokemonId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`
}

/** Neutral silhouette shown when an image fails to load. Inline so it can never fail itself. */
export const PLACEHOLDER_IMAGE_URL =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<circle cx="50" cy="36" r="18" fill="#c4c4c4"/>' +
      '<path d="M16 92c0-20 15-34 34-34s34 14 34 34z" fill="#c4c4c4"/>' +
      '</svg>',
  )
