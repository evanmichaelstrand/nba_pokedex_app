import { useMemo } from 'react'
import { SEASON } from '../config'
import type { Entry } from '../data'
import { useArrowKeys } from '../hooks/useArrowKeys'
import { useDeckNavigation } from '../hooks/useDeckNavigation'
import { useWriteHash } from '../hooks/useHashView'
import { usePreloadImages } from '../hooks/usePreloadImages'
import { playerHeadshotUrls, pokemonArtworkUrl } from '../lib/images'
import { filterEntries } from '../lib/search'
import { sortEntries, type SortKey } from '../lib/sort'
import { statScaleMax } from '../lib/stats'
import { BackgroundLogo } from './BackgroundLogo'
import { Deck } from './Deck'
import { FilterChip } from './FilterChip'
import { NavControls } from './NavControls'
import { NoMatches } from './NoMatches'

interface PokedexProps {
  entries: Entry[]
  /** Player to open on (from a shared link); falls back to the first entry if absent. */
  initialPlayerId: number | null
  query: string
  sort: SortKey
  onClearQuery: () => void
}

export function Pokedex({ entries, initialPlayerId, query, sort, onClearQuery }: PokedexProps) {
  const deck = useMemo(() => sortEntries(filterEntries(entries, query), sort), [entries, query, sort])
  // Scale comes from the full dataset so bars mean the same thing whatever the filter.
  const scaleMax = useMemo(() => statScaleMax(entries), [entries])
  const { index, current, netSteps, next, previous } = useDeckNavigation(deck, initialPlayerId)
  useArrowKeys(previous, next)
  useWriteHash({ playerId: current?.id ?? null, query, sort })

  // Warm the cache for everything the next few moves can bring into focus.
  const ahead = [1, -1, 2, -2, 3, -3].map((o) => deck[(((index + o) % deck.length) + deck.length) % deck.length])
  // (First choice of each image only; fallbacks are rare and load on demand.)
  usePreloadImages(
    ahead.flatMap((e) =>
      e ? [playerHeadshotUrls(e.id, [e.player.mainTeam], SEASON?.startYear ?? null)[0], pokemonArtworkUrl(e.pokemon.id)] : [],
    ),
  )

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
