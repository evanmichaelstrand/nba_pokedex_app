import { useCallback, useEffect, useState } from 'react'
import { createEntrySource, type Entry, type EntrySource } from '../data'

export type EntriesState =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; entries: Entry[] }

/** Loads all entries from the configured EntrySource. `retry` starts a fresh load. */
export function useEntries(createSource: () => EntrySource = createEntrySource) {
  const [state, setState] = useState<EntriesState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const entries = await createSource().listEntries()
        if (!cancelled) setState({ status: 'ready', entries })
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        console.error('Failed to load entries:', error)
        if (!cancelled) setState({ status: 'error', error })
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [createSource, attempt])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((n) => n + 1)
  }, [])

  return { state, retry }
}
