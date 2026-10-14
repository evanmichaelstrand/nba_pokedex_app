import { useMemo, useState } from 'react'
import { Pokedex } from './components/Pokedex'
import { SearchBar } from './components/SearchBar'
import { SortSelect } from './components/SortSelect'
import { ErrorMessage, LoadingMessage } from './components/StatusMessage'
import { useEntries } from './hooks/useEntries'
import { availableSortKeys, DEFAULT_SORT, type SortKey } from './lib/sort'

export default function App() {
  const { state, retry } = useEntries()
  const [query, setQuery] = useState('')
  const [sortChoice, setSortChoice] = useState<SortKey>(DEFAULT_SORT)
  const clearQuery = () => setQuery('')

  const entries = state.status === 'ready' ? state.entries : null
  const sortOptions = useMemo(() => (entries ? availableSortKeys(entries) : []), [entries])
  // A choice the data can't support (e.g. Position before the pipeline adds it) falls back to the default.
  const sort = sortOptions.includes(sortChoice) ? sortChoice : DEFAULT_SORT

  return (
    <div className="app">
      <header className="app-header">
        <img className="app-logo" src={`${import.meta.env.BASE_URL}logo-color.jpg`} alt="" />
        <h1 className="app-title">NBA Pokédex</h1>
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
        {entries && <Pokedex entries={entries} query={query} sort={sort} onClearQuery={clearQuery} />}
      </main>
    </div>
  )
}
