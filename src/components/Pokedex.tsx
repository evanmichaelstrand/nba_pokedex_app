import { useMemo, type CSSProperties } from 'react'
import type { Entry } from '../data'
import { useArrowKeys } from '../hooks/useArrowKeys'
import { useDeckNavigation } from '../hooks/useDeckNavigation'
import { usePreloadImages } from '../hooks/usePreloadImages'
import { sortByPokemonId } from '../lib/deck'
import { playerHeadshotUrl, pokemonArtworkUrl } from '../lib/images'
import { statScaleMax } from '../lib/stats'
import { BackgroundLogo } from './BackgroundLogo'
import { EntryCard } from './EntryCard'
import { NavControls } from './NavControls'
import { SwipeArea } from './SwipeArea'

export function Pokedex({ entries }: { entries: Entry[] }) {
  const deck = useMemo(() => sortByPokemonId(entries), [entries])
  const scaleMax = useMemo(() => statScaleMax(entries), [entries])
  const { index, current, direction, netSteps, next, previous } = useDeckNavigation(deck)
  useArrowKeys(previous, next)

  const neighbors = [deck[(index + 1) % deck.length], deck[(index - 1 + deck.length) % deck.length]]
  usePreloadImages(neighbors.flatMap((e) => (e ? [playerHeadshotUrl(e.id), pokemonArtworkUrl(e.pokemon.id)] : [])))

  if (!current) return null
  return (
    <div className="pokedex" style={{ '--enter-from': direction } as CSSProperties}>
      <BackgroundLogo netSteps={netSteps} />
      {/* Swipe left = next, swipe right = previous. */}
      <SwipeArea onSwipeLeft={next} onSwipeRight={previous}>
        <EntryCard key={current.id} entry={current} statScaleMax={scaleMax} />
      </SwipeArea>
      <NavControls index={index} total={deck.length} onPrevious={previous} onNext={next} />
    </div>
  )
}
