/** Pokémon IDs above this are PokéAPI form IDs, not National Dex numbers. */
const FORM_ID_THRESHOLD = 10000

/** Names that plain title-casing gets wrong. Keyed by the base-species slug. */
const SPECIAL_NAMES: Readonly<Record<string, string>> = {
  'mr-mime': 'Mr. Mime',
  'mr-rime': 'Mr. Rime',
  'mime-jr': 'Mime Jr.',
  'ho-oh': 'Ho-Oh',
  'porygon-z': 'Porygon-Z',
  'jangmo-o': 'Jangmo-o',
  'hakamo-o': 'Hakamo-o',
  'kommo-o': 'Kommo-o',
  'nidoran-f': 'Nidoran♀',
  'nidoran-m': 'Nidoran♂',
  farfetchd: 'Farfetch’d',
  sirfetchd: 'Sirfetch’d',
  flabebe: 'Flabébé',
  'type-null': 'Type: Null',
  'wo-chien': 'Wo-Chien',
  'chien-pao': 'Chien-Pao',
  'ting-lu': 'Ting-Lu',
  'chi-yu': 'Chi-Yu',
}

/** PokéAPI suffixes that mark a species' default form; dropped so "giratina-altered" shows as "Giratina". */
const DEFAULT_FORM_SUFFIXES = [
  'normal', 'plant', 'altered', 'land', 'red-striped', 'standard', 'incarnate', 'ordinary', 'aria',
  'male', 'shield', 'average', '50', 'baile', 'midday', 'solo', 'red-meteor', 'disguised', 'amped',
  'ice', 'full-belly', 'single-strike', 'family-of-four', 'green-plumage', 'zero', 'curly', 'two-segment',
]

function stripDefaultForm(slug: string): string {
  const suffix = DEFAULT_FORM_SUFFIXES.find((s) => slug.endsWith(`-${s}`) && slug.length > s.length + 1)
  return suffix ? slug.slice(0, -(suffix.length + 1)) : slug
}

/** Form suffixes shown as a prefix, e.g. "raichu-alola" → "Alolan Raichu". */
const PREFIX_FORMS: Readonly<Record<string, string>> = {
  mega: 'Mega',
  primal: 'Primal',
  gmax: 'Gigantamax',
  alola: 'Alolan',
  galar: 'Galarian',
  hisui: 'Hisuian',
  paldea: 'Paldean',
}

function titleCase(words: string): string {
  return words
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Turns a PokéAPI slug into a display name:
 * "starmie" → "Starmie", "tyranitar-mega" → "Mega Tyranitar", "charizard-mega-x" → "Mega Charizard X".
 */
export function formatPokemonName(slug: string): string {
  const lower = stripDefaultForm(slug.trim().toLowerCase())
  const special = SPECIAL_NAMES[lower]
  if (special) return special

  const parts = lower.split('-')
  const formIndex = parts.findIndex((p, i) => i > 0 && p in PREFIX_FORMS)
  if (formIndex === -1) return titleCase(lower)

  const base = parts.slice(0, formIndex).join('-')
  const variant = parts.slice(formIndex + 1).join('-')
  const baseName = SPECIAL_NAMES[base] ?? titleCase(base)
  return [PREFIX_FORMS[parts[formIndex]], baseName, variant && titleCase(variant)].filter(Boolean).join(' ')
}

const NAME_SUFFIX = /^(jr|sr)\.?$|^(ii|iii|iv|v)$/i

/**
 * Compact player name for tight spots like chart legends: the surname without generational suffixes,
 * keeping lowercase particles. "Jaren Jackson Jr." → "Jackson", "Tristan da Silva" → "da Silva".
 */
export function shortPlayerName(fullName: string): string {
  const words = fullName.trim().split(/\s+/)
  while (words.length > 1 && NAME_SUFFIX.test(words[words.length - 1])) words.pop()
  const surname = [words.pop() ?? '']
  // Particles like "da", "van", "de" belong to the surname.
  while (words.length > 1 && /^[a-z]/.test(words[words.length - 1])) surname.unshift(words.pop()!)
  return surname.join(' ')
}

/** "#121", or null for form IDs (which aren't Dex numbers). */
export function formatDexNumber(pokemonId: number): string | null {
  return pokemonId > FORM_ID_THRESHOLD ? null : `#${pokemonId}`
}

/** "water" → "Water". */
export function formatTypeName(type: string): string {
  return titleCase(type)
}

/** 0.8291 → "83%". */
export function formatMatchPercent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`
}

/** 78 → `6'6"`. */
export function formatHeight(inches: number): string {
  const total = Math.round(inches)
  return `${Math.floor(total / 12)}'${total % 12}"`
}
