export type Theme = 'light' | 'dark'

/** localStorage key for an explicit choice. index.html reads it too, to set the theme before first paint. */
export const THEME_STORAGE_KEY = 'nbaPokedex.theme'

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

/** An explicit stored choice wins; otherwise follow the device setting. */
export function resolveTheme(stored: string | null, systemPrefersDark: boolean): Theme {
  if (isTheme(stored)) return stored
  return systemPrefersDark ? 'dark' : 'light'
}
