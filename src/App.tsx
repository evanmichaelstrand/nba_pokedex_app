import { ErrorMessage, LoadingMessage } from './components/StatusMessage'
import { useEntries } from './hooks/useEntries'

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
        {state.status === 'ready' && <p>{state.entries.length} entries loaded</p>}
      </main>
    </div>
  )
}
