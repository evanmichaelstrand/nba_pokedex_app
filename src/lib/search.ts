import type { Entry } from '../data'
import { formatPokemonName } from './format'
import { getTeam } from './teams'

/** Lowercase and strip accents, so "jokic" finds "Jokić" and "pokemon" finds "Pokémon". */
export function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

function searchableText(entry: Entry): string {
  const teams = [entry.player.mainTeam, ...entry.player.otherTeams].flatMap((abbr) => [abbr, getTeam(abbr).name])
  return normalizeText([entry.player.name, formatPokemonName(entry.pokemon.name), ...teams].join(' | '))
}

/**
 * True when every word of the query appears somewhere in the entry's player name, Pokémon name,
 * or team names/abbreviations (main and other teams). An empty query matches everything.
 */
export function matchesQuery(entry: Entry, query: string): boolean {
  const words = normalizeText(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return true
  const haystack = searchableText(entry)
  return words.every((word) => haystack.includes(word))
}

export function filterEntries(entries: readonly Entry[], query: string): Entry[] {
  return entries.filter((entry) => matchesQuery(entry, query))
}
