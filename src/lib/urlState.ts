import { DEFAULT_SORT, isSortKey, type SortKey } from './sort'

/** The part of the view a shared link reproduces. */
export interface ViewState {
  playerId: number | null
  query: string
  sort: SortKey
}

const PLAYER_PATH = /^\/?player\/(\d+)\/?$/

/**
 * Reads a hash like `#/player/203932?q=lakers&sort=team`. Anything missing or invalid falls back to
 * the defaults (no player, empty search, default sort), so a bad link still opens the app.
 */
export function parseHash(hash: string): ViewState {
  const raw = hash.replace(/^#/, '')
  const queryStart = raw.indexOf('?')
  const path = queryStart === -1 ? raw : raw.slice(0, queryStart)
  const params = new URLSearchParams(queryStart === -1 ? '' : raw.slice(queryStart + 1))

  const idMatch = PLAYER_PATH.exec(path)
  const sort = params.get('sort') ?? ''
  return {
    playerId: idMatch ? Number(idMatch[1]) : null,
    query: params.get('q') ?? '',
    sort: isSortKey(sort) ? sort : DEFAULT_SORT,
  }
}

/** Builds the hash for a view. Defaults (empty search, default sort) are left out. */
export function buildHash({ playerId, query, sort }: ViewState): string {
  const params = new URLSearchParams()
  if (query.trim()) params.set('q', query)
  if (sort !== DEFAULT_SORT) params.set('sort', sort)
  const path = playerId === null ? '/' : `/player/${playerId}`
  const search = params.toString()
  return `#${path}${search ? `?${search}` : ''}`
}
