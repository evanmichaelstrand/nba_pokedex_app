import { CsvEntrySource } from './CsvEntrySource'
import type { EntrySource } from './EntrySource'

export type { Entry, Player, Pokemon, RealStats, StatAdjustments, StatLine } from './entry'
export type { EntrySource } from './EntrySource'

type SourceEnv = Pick<ImportMetaEnv, 'BASE_URL' | 'VITE_DATA_SOURCE' | 'VITE_CSV_URL'>

/** The one place that decides which data source the app uses. */
export function createEntrySource(env: SourceEnv = import.meta.env): EntrySource {
  const kind = env.VITE_DATA_SOURCE || 'csv'
  switch (kind) {
    case 'csv':
      if (!env.VITE_CSV_URL) throw new Error('VITE_CSV_URL is not set')
      return new CsvEntrySource(env.BASE_URL + env.VITE_CSV_URL)
    default:
      throw new Error(`Unknown VITE_DATA_SOURCE "${kind}"`)
  }
}
