import { useMemo } from 'react'
import type { Entry } from '../data'
import { useArrowKeys } from '../hooks/useArrowKeys'
import { useDeckNavigation } from '../hooks/useDeckNavigation'
import { usePreloadImages } from '../hooks/usePreloadImages'
import { sortByPokemonId } from '../lib/deck'
import { playerHeadshotUrl, pokemonArtworkUrl } from '../lib/images'
import { statScaleMax } from '../lib/stats'
import { EntryCard } from './EntryCard'
import { NavControls } from './NavControls'

export function Pokedex({ entries }: { entries: Entry[] }) {
  const deck = useMemo(() => sortByPokemonId(entries), [entries])
  const scaleMax = useMemo(() => statScaleMax(entries), [entries])
  const { index, current, next, previous } = useDeckNavigation(deck)
  useArrowKeys(previous, next)

  const neighbors = [deck[(index + 1) % deck.length], deck[(index - 1 + deck.length) % deck.length]]
  usePreloadImages(neighbors.flatMap((e) => (e ? [playerHeadshotUrl(e.id), pokemonArtworkUrl(e.pokemon.id)] : [])))

  if (!current) return null
  return (
    <div className="pokedex">
      <EntryCard key={current.id} entry={current} statScaleMax={scaleMax} />
      <NavControls index={index} total={deck.length} onPrevious={previous} onNext={next} />
    </div>
  )
}
