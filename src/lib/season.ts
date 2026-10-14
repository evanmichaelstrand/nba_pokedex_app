export interface Season {
  /** Calendar year the season starts in; NBA.com keys season headshots by it (2025 for 2025-26). */
  startYear: number
  /** Display label, e.g. "2025–26 Regular Season". */
  label: string
}

/** Parses a season like "2025-26". Returns null if unset or malformed, so the app still runs. */
export function parseSeason(value: string | undefined): Season | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value?.trim() ?? '')
  if (!match) return null
  const startYear = Number(match[1])
  const endSuffix = match[2]
  if (Number(endSuffix) !== (startYear + 1) % 100) return null
  return { startYear, label: `${startYear}–${endSuffix} Regular Season` }
}
