import { useState, type ImgHTMLAttributes } from 'react'
import { PLACEHOLDER_IMAGE_URL } from '../lib/images'

type FallbackImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> & {
  /** URLs to try in order; a neutral placeholder follows the last one. */
  sources: readonly string[]
  alt: string
  /** Show the placeholder for now and load nothing (e.g. while the user is scrubbing past). */
  deferred?: boolean
}

/** An <img> that works through its sources on error, ending at a placeholder — never a broken-image icon. */
export function FallbackImage({ sources, alt, deferred = false, ...rest }: FallbackImageProps) {
  const key = sources.join('\n')
  // Failures are counted per source list, so the count resets automatically when the sources change.
  const [failures, setFailures] = useState({ key, count: 0 })
  const failed = failures.key === key ? failures.count : 0
  const src = deferred ? PLACEHOLDER_IMAGE_URL : (sources[failed] ?? PLACEHOLDER_IMAGE_URL)
  return (
    <img
      {...rest}
      src={src}
      alt={alt}
      data-fallback={(!deferred && src === PLACEHOLDER_IMAGE_URL) || undefined}
      data-deferred={deferred || undefined}
      onError={() => {
        if (!deferred) setFailures({ key, count: failed + 1 })
      }}
    />
  )
}
