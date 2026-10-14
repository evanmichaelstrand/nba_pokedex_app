import { useEffect, useState } from 'react'

export type ChartMode = 'bars' | 'radar'

const STORAGE_KEY = 'nbaPokedex.chartMode'

function readStored(): ChartMode {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'radar' ? 'radar' : 'bars'
  } catch {
    return 'bars'
  }
}

/** Which stat chart to show; remembered per browser as a convenience (falls back to bars). */
export function useChartMode() {
  const [mode, setMode] = useState<ChartMode>(readStored)
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // Storage can be unavailable (private mode, blocked); the choice just won't persist.
    }
  }, [mode])
  return [mode, setMode] as const
}
