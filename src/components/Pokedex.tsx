import { useMemo } from 'react'
import type { Entry } from '../data'
import { useArrowKeys } from '../hooks/useArrowKeys'
import { useDeckNavigation } from '../hooks/useDeckNavigation'
import { usePreloadImages } from '../hooks/usePreloadImages'
import { sortByPokemonId } from '../lib/deck'
import { playerHeadshotUrl, pokemonArtworkUrl } from '../lib/images'
import { statScaleMax } from '../lib/stats'
import { BackgroundLogo } from './BackgroundLogo'
import { Deck } from './Deck'
import { NavControls } from './NavControls'

export function Pokedex({ entries }: { entries: Entry[] }) {
  const deck = useMemo(() => sortByPokemonId(entries), [entries])
  const scaleMax = useMemo(() => statScaleMax(entries), [entries])
  const { index, current, netSteps, next, previous } = useDeckNavigation(deck)
  useArrowKeys(previous, next)

  // Warm the cache for everything the next few moves can bring into focus.
  const ahead = [1, -1, 2, -2, 3, -3].map((o) => deck[(((index + o) % deck.length) + deck.length) % deck.length])
  usePreloadImages(ahead.flatMap((e) => (e ? [playerHeadshotUrl(e.id), pokemonArtworkUrl(e.pokemon.id)] : [])))

  if (!current) return null
  return (
    <div className="pokedex">
      <BackgroundLogo netSteps={netSteps} />
      <Deck
        deck={deck}
        index={index}
        netSteps={netSteps}
        statScaleMax={scaleMax}
        onNext={next}
        onPrevious={previous}
      />
      <NavControls index={index} total={deck.length} onPrevious={previous} onNext={next} />
    </div>
  )
}
