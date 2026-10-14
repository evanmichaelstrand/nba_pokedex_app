import { useState } from 'react'
import { Pokedex } from './components/Pokedex'
import { SearchBar } from './components/SearchBar'
import { ErrorMessage, LoadingMessage } from './components/StatusMessage'
import { useEntries } from './hooks/useEntries'

export default function App() {
  const { state, retry } = useEntries()
  const [query, setQuery] = useState('')
  const clearQuery = () => setQuery('')

  return (
    <div className="app">
      <header className="app-header">
        <img className="app-logo" src={`${import.meta.env.BASE_URL}logo-color.jpg`} alt="" />
        <h1 className="app-title">NBA Pokédex</h1>
        {state.status === 'ready' && <SearchBar query={query} onQueryChange={setQuery} />}
      </header>
      <main className="app-main">
        {state.status === 'loading' && <LoadingMessage />}
        {state.status === 'error' && <ErrorMessage onRetry={retry} />}
        {state.status === 'ready' && <Pokedex entries={state.entries} query={query} onClearQuery={clearQuery} />}
      </main>
    </div>
  )
}
