import { useEffect, useState } from 'react'
import { resolveTheme, THEME_STORAGE_KEY, type Theme } from '../lib/theme'
import { useMediaQuery } from './useMediaQuery'

function readStored(): string | null {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY)
  } catch {
    return null
  }
}

/**
 * Light or dark: follows the device until the viewer picks one, then remembers that choice per browser.
 * Applies it as `data-theme` on <html>, which the color tokens in index.css key off.
 */
export function useTheme() {
  const systemPrefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const [stored, setStored] = useState(readStored)
  const theme = resolveTheme(stored, systemPrefersDark)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const setTheme = (next: Theme) => {
    setStored(next)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage can be unavailable (private mode, blocked); the choice just won't persist.
    }
  }

  return [theme, setTheme] as const
}
