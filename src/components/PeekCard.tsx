import type { Entry } from '../data'
import { formatPokemonName } from '../lib/format'
import { pokemonSpriteUrls } from '../lib/images'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { FallbackImage } from './FallbackImage'
import './PeekCard.css'

interface PeekCardProps {
  entry: Entry
  /** Which side of the focused card this sits on; content hugs the edge that stays visible. */
  side: 'left' | 'right'
}

/** Lightweight neighbor card for narrow screens: just the Pokémon artwork and the player's name. */
export function PeekCard({ entry, side }: PeekCardProps) {
  const animated = !useMediaQuery('(prefers-reduced-motion: reduce)')
  return (
    <div className="peek-card" data-side={side}>
      <FallbackImage className="peek-image" sources={pokemonSpriteUrls(entry.pokemon.id, animated)} alt="" />
      <p className="peek-name">{entry.player.name}</p>
      <p className="peek-pokemon">{formatPokemonName(entry.pokemon.name)}</p>
    </div>
  )
}
