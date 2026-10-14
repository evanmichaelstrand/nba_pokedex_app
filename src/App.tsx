import { useMemo } from 'react'
import { EntryCard } from './components/EntryCard'
import { ErrorMessage, LoadingMessage } from './components/StatusMessage'
import type { Entry } from './data'
import { useEntries } from './hooks/useEntries'
import { statScaleMax } from './lib/stats'

function Pokedex({ entries }: { entries: Entry[] }) {
  const scaleMax = useMemo(() => statScaleMax(entries), [entries])
  // Navigation comes in the next plan item; for now show the first entry.
  return <EntryCard entry={entries[0]} statScaleMax={scaleMax} />
}

export default function App() {
  const { state, retry } = useEntries()

  return (
    <div className="app">
      <header className="app-header">
        <img className="app-logo" src={`${import.meta.env.BASE_URL}logo-color.jpg`} alt="" />
        <h1 className="app-title">NBA Pokédex</h1>
      </header>
      <main className="app-main">
        {state.status === 'loading' && <LoadingMessage />}
        {state.status === 'error' && <ErrorMessage onRetry={retry} />}
        {state.status === 'ready' && <Pokedex entries={state.entries} />}
      </main>
    </div>
  )
}
