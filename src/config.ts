import { parseSeason } from './lib/season'

/** The season the dataset covers (from VITE_SEASON); null hides the label and uses latest headshots. */
export const SEASON = parseSeason(import.meta.env.VITE_SEASON)
