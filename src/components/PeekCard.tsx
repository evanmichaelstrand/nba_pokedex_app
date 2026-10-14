import type { CSSProperties } from 'react'
import type { Entry } from '../data'
import { formatPokemonName } from '../lib/format'
import { pokemonSpriteUrls } from '../lib/images'
import { getTeam } from '../lib/teams'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { FallbackImage } from './FallbackImage'
import './PeekCard.css'

interface PeekCardProps {
  entry: Entry
  /** Which side of the focused card this sits on; content hugs the edge that stays visible. */
  side: 'left' | 'right'
  /** Hold off on loading images (while scrubbing). */
  deferImages?: boolean
}

/** Lightweight neighbor card for narrow screens: just the Pokémon artwork and the player's name. */
export function PeekCard({ entry, side, deferImages = false }: PeekCardProps) {
  const animated = !useMediaQuery('(prefers-reduced-motion: reduce)')
  return (
    <div
      className="peek-card"
      data-side={side}
      style={{ '--team-color': getTeam(entry.player.mainTeam).color } as CSSProperties}
    >
      <FallbackImage className="peek-image" deferred={deferImages} sources={pokemonSpriteUrls(entry.pokemon.id, animated)} alt="" />
      <p className="peek-name">{entry.player.name}</p>
      <p className="peek-pokemon">{formatPokemonName(entry.pokemon.name)}</p>
    </div>
  )
}
