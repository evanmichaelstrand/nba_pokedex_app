import { useMemo, useState } from 'react'
import { Pokedex } from './components/Pokedex'
import { SearchBar } from './components/SearchBar'
import { SortSelect } from './components/SortSelect'
import { ErrorMessage, LoadingMessage } from './components/StatusMessage'
import { SEASON } from './config'
import { useEntries } from './hooks/useEntries'
import { useHashView } from './hooks/useHashView'
import { availableSortKeys, DEFAULT_SORT, type SortKey } from './lib/sort'

export default function App() {
  const { state, retry } = useEntries()
  const requested = useHashView()
  const [query, setQuery] = useState(requested.view.query)
  const [sortChoice, setSortChoice] = useState<SortKey>(requested.view.sort)

  // A link opened in this tab (hash edited from outside) replaces search and sort.
  const [appliedVersion, setAppliedVersion] = useState(requested.version)
  if (requested.version !== appliedVersion) {
    setAppliedVersion(requested.version)
    setQuery(requested.view.query)
    setSortChoice(requested.view.sort)
  }

  const entries = state.status === 'ready' ? state.entries : null
  const sortOptions = useMemo(() => (entries ? availableSortKeys(entries) : []), [entries])
  // A choice the data can't support (e.g. Position before the pipeline adds it) falls back to the default.
  const sort = sortOptions.includes(sortChoice) ? sortChoice : DEFAULT_SORT

  return (
    <div className="app">
      <header className="app-header">
        <img className="app-logo" src={`${import.meta.env.BASE_URL}logo-color-128.png`} alt="" />
        <div className="app-title-block">
          <h1 className="app-title">NBA Pokédex</h1>
          {SEASON && <p className="app-season">{SEASON.label}</p>}
        </div>
        {entries && (
          <>
            <SearchBar query={query} onQueryChange={setQuery} />
            <SortSelect value={sort} options={sortOptions} onChange={setSortChoice} />
          </>
        )}
      </header>
      <main className="app-main">
        {state.status === 'loading' && <LoadingMessage />}
        {state.status === 'error' && <ErrorMessage onRetry={retry} />}
        {entries && (
          <Pokedex
            // Remount on an outside link so it opens on the linked player.
            key={requested.version}
            entries={entries}
            initialPlayerId={requested.view.playerId}
            query={query}
            sort={sort}
            onClearQuery={() => setQuery('')}
          />
        )}
      </main>
    </div>
  )
}
