import { useState, type ImgHTMLAttributes } from 'react'
import { PLACEHOLDER_IMAGE_URL } from '../lib/images'

type FallbackImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> & {
  /** URLs to try in order; a neutral placeholder follows the last one. */
  sources: readonly string[]
  alt: string
}

/** An <img> that works through its sources on error, ending at a placeholder — never a broken-image icon. */
export function FallbackImage({ sources, alt, ...rest }: FallbackImageProps) {
  const key = sources.join('\n')
  // Failures are counted per source list, so the count resets automatically when the sources change.
  const [failures, setFailures] = useState({ key, count: 0 })
  const failed = failures.key === key ? failures.count : 0
  const src = sources[failed] ?? PLACEHOLDER_IMAGE_URL
  return (
    <img
      {...rest}
      src={src}
      alt={alt}
      data-fallback={src === PLACEHOLDER_IMAGE_URL || undefined}
      onError={() => setFailures({ key, count: failed + 1 })}
    />
  )
}
