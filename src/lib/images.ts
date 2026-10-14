import { getTeam } from './teams'

const NBA_CDN = 'https://cdn.nba.com'
const POKEAPI_SPRITES = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'

/**
 * Headshot URLs to try in order: the season photo with each team the player played for (main team
 * first), then NBA.com's latest photo. Without a season, only the latest photo is used.
 */
export function playerHeadshotUrls(playerId: number, teams: readonly string[], seasonStartYear: number | null): string[] {
  const seasonal =
    seasonStartYear === null
      ? []
      : teams.flatMap((abbr) => {
          const teamId = getTeam(abbr).id
          return teamId ? [`${NBA_CDN}/headshots/nba/${teamId}/${seasonStartYear}/1040x760/${playerId}.png`] : []
        })
  return [...seasonal, `${NBA_CDN}/headshots/nba/latest/1040x760/${playerId}.png`]
}

export function pokemonArtworkUrl(pokemonId: number): string {
  return `${POKEAPI_SPRITES}/other/official-artwork/${pokemonId}.png`
}

/** Sprite URLs to try in order: the animated Showdown sprite (unless motion is off), then official artwork. */
export function pokemonSpriteUrls(pokemonId: number, animated: boolean): string[] {
  const artwork = pokemonArtworkUrl(pokemonId)
  return animated ? [`${POKEAPI_SPRITES}/other/showdown/${pokemonId}.gif`, artwork] : [artwork]
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
