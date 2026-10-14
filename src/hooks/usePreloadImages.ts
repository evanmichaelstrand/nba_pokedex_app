import { useEffect } from 'react'

/** Warms the browser cache for images the user is likely to see next. */
export function usePreloadImages(urls: readonly string[]) {
  const key = urls.join('\n')
  useEffect(() => {
    for (const url of key.split('\n')) {
      if (url) new Image().src = url
    }
  }, [key])
}
