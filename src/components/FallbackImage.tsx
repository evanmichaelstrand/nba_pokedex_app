import { useState, type ImgHTMLAttributes } from 'react'
import { PLACEHOLDER_IMAGE_URL } from '../lib/images'

type FallbackImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> & {
  src: string
  alt: string
}

/** An <img> that swaps to a neutral placeholder if it fails to load, so no broken-image icon ever shows. */
export function FallbackImage({ src, alt, ...rest }: FallbackImageProps) {
  // Tracking which src failed (rather than a boolean) resets automatically when src changes.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const failed = failedSrc === src
  return (
    <img
      {...rest}
      src={failed ? PLACEHOLDER_IMAGE_URL : src}
      alt={alt}
      data-fallback={failed || undefined}
      onError={() => setFailedSrc(src)}
    />
  )
}
