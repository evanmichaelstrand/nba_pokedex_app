import { useEffect } from 'react'
import { SEASON } from '../config'
import type { Entry } from '../data'
import { playerHeadshotUrls, pokemonSpriteUrls } from '../lib/images'
import { useMediaQuery } from './useMediaQuery'

const AHEAD = [1, -1, 2, -2, 3, -3]

/** Warms the browser cache for images the user is likely to see next. */
export function usePreloadImages(urls: readonly string[]) {
  const key = urls.join('\n')
  useEffect(() => {
    for (const url of key.split('\n')) {
      if (url) new Image().src = url
    }
  }, [key])
}

/**
 * Preloads the first-choice headshot and sprite for every entry the next few moves can bring into
 * focus (fallbacks are rare and load on demand). Pass `enabled: false` to pause, e.g. while scrubbing.
 */
export function usePreloadNeighbors(deck: readonly Entry[], index: number, enabled: boolean) {
  const animated = !useMediaQuery('(prefers-reduced-motion: reduce)')
  const n = deck.length
  const urls =
    enabled && n > 0
      ? AHEAD.map((o) => deck[(((index + o) % n) + n) % n]).flatMap((e) => [
          playerHeadshotUrls(e.id, [e.player.mainTeam], SEASON?.startYear ?? null)[0],
          pokemonSpriteUrls(e.pokemon.id, animated)[0],
        ])
      : []
  usePreloadImages(urls)
}
