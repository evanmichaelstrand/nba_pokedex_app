import { useEffect, useRef, useState } from 'react'
import { buildHash, parseHash, type ViewState } from '../lib/urlState'

/**
 * The view requested by the URL hash. `version` bumps whenever the hash is changed from outside the
 * app (a pasted link, a manual edit), so callers can reset to the new view.
 */
export function useHashView() {
  const [requested, setRequested] = useState(() => ({ view: parseHash(window.location.hash), version: 0 }))

  useEffect(() => {
    // Our own writes use replaceState, which doesn't fire hashchange, so this only sees outside edits.
    const handleHashChange = () =>
      setRequested((r) => ({ view: parseHash(window.location.hash), version: r.version + 1 }))
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return requested
}

/** Minimum gap between URL writes, so fast flipping stays under Safari's replaceState rate limit. */
const WRITE_INTERVAL_MS = 250

function replaceHash(hash: string) {
  if (hash !== window.location.hash) {
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}${hash}`)
  }
}

/**
 * Mirrors the view into the URL without adding history entries (Back still leaves the site).
 * Throttled: a change is written at once unless one was just written, in which case the latest
 * view is written as soon as the interval allows.
 */
export function useWriteHash(view: ViewState) {
  const hash = buildHash(view)
  const lastWrite = useRef(0)

  useEffect(() => {
    const write = () => {
      replaceHash(hash)
      lastWrite.current = Date.now()
    }
    const wait = lastWrite.current + WRITE_INTERVAL_MS - Date.now()
    if (wait <= 0) {
      write()
      return
    }
    const timer = window.setTimeout(write, wait)
    return () => window.clearTimeout(timer)
  }, [hash])
}
