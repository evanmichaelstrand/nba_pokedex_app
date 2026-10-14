import type { Entry } from '../data'
import { formatPokemonName } from '../lib/format'
import { pokemonArtworkUrl } from '../lib/images'
import { FallbackImage } from './FallbackImage'
import './PeekCard.css'

interface PeekCardProps {
  entry: Entry
  /** Which side of the focused card this sits on; content hugs the edge that stays visible. */
  side: 'left' | 'right'
}

/** Lightweight neighbor card for narrow screens: just the Pokémon artwork and the player's name. */
export function PeekCard({ entry, side }: PeekCardProps) {
  return (
    <div className="peek-card" data-side={side}>
      <FallbackImage className="peek-image" sources={[pokemonArtworkUrl(entry.pokemon.id)]} alt="" />
      <p className="peek-name">{entry.player.name}</p>
      <p className="peek-pokemon">{formatPokemonName(entry.pokemon.name)}</p>
    </div>
  )
}
