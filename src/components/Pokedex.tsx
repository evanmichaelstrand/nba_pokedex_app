import { useMemo } from 'react'
import type { Entry } from '../data'
import { useArrowKeys } from '../hooks/useArrowKeys'
import { useDeckNavigation } from '../hooks/useDeckNavigation'
import { usePreloadImages } from '../hooks/usePreloadImages'
import { sortByPokemonId } from '../lib/deck'
import { playerHeadshotUrl, pokemonArtworkUrl } from '../lib/images'
import { filterEntries } from '../lib/search'
import { statScaleMax } from '../lib/stats'
import { BackgroundLogo } from './BackgroundLogo'
import { Deck } from './Deck'
import { FilterChip } from './FilterChip'
import { NavControls } from './NavControls'
import { NoMatches } from './NoMatches'

interface PokedexProps {
  entries: Entry[]
  query: string
  onClearQuery: () => void
}

export function Pokedex({ entries, query, onClearQuery }: PokedexProps) {
  const deck = useMemo(() => sortByPokemonId(filterEntries(entries, query)), [entries, query])
  // Scale comes from the full dataset so bars mean the same thing whatever the filter.
  const scaleMax = useMemo(() => statScaleMax(entries), [entries])
  const { index, current, netSteps, next, previous } = useDeckNavigation(deck)
  useArrowKeys(previous, next)

  // Warm the cache for everything the next few moves can bring into focus.
  const ahead = [1, -1, 2, -2, 3, -3].map((o) => deck[(((index + o) % deck.length) + deck.length) % deck.length])
  usePreloadImages(ahead.flatMap((e) => (e ? [playerHeadshotUrl(e.id), pokemonArtworkUrl(e.pokemon.id)] : [])))

  const filtered = query.trim() !== ''
  return (
    <div className="pokedex">
      <BackgroundLogo netSteps={netSteps} />
      {current ? (
        <>
          <Deck
            deck={deck}
            index={index}
            netSteps={netSteps}
            statScaleMax={scaleMax}
            onNext={next}
            onPrevious={previous}
          />
          <NavControls index={index} total={deck.length} onPrevious={previous} onNext={next}>
            {filtered && <FilterChip query={query} onClear={onClearQuery} />}
          </NavControls>
        </>
      ) : (
        <NoMatches query={query} onClear={onClearQuery} />
      )}
    </div>
  )
}
