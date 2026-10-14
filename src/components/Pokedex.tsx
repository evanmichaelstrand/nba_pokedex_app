import { useMemo } from 'react'
import type { Entry } from '../data'
import { useArrowKeys } from '../hooks/useArrowKeys'
import { useDeckNavigation } from '../hooks/useDeckNavigation'
import { useWriteHash } from '../hooks/useHashView'
import { usePreloadNeighbors } from '../hooks/usePreloadImages'
import { useScrubbing } from '../hooks/useScrubbing'
import { filterEntries } from '../lib/search'
import { sortEntries, type SortKey } from '../lib/sort'
import { statScaleMax } from '../lib/stats'
import { BackgroundLogo } from './BackgroundLogo'
import { Deck } from './Deck'
import { FilterChip } from './FilterChip'
import { NavControls } from './NavControls'
import { NoMatches } from './NoMatches'
import { ProgressSlider } from './ProgressSlider'

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
  const { index, current, netSteps, next, previous, goTo } = useDeckNavigation(deck, initialPlayerId)
  // While the slider is being dragged, text updates live and images wait until release.
  const [scrubbing, setScrubbing] = useScrubbing()
  useArrowKeys(previous, next)
  useWriteHash({ playerId: current?.id ?? null, query, sort })
  usePreloadNeighbors(deck, index, !scrubbing)

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
            deferImages={scrubbing}
            onNext={next}
            onPrevious={previous}
          />
          <NavControls
            index={index}
            total={deck.length}
            onPrevious={previous}
            onNext={next}
            slider={
              <ProgressSlider
                index={index}
                total={deck.length}
                currentLabel={current.player.name}
                onChange={goTo}
                onScrubbingChange={setScrubbing}
              />
            }
          >
            {filtered && <FilterChip query={query} onClear={onClearQuery} />}
          </NavControls>
        </>
      ) : (
        <NoMatches query={query} onClear={onClearQuery} />
      )}
    </div>
  )
}
