import type { Entry } from './entry'

/** The only way the app gets data. Implementations: CsvEntrySource (now), an API source (later). */
export interface EntrySource {
  listEntries(): Promise<Entry[]>
}
