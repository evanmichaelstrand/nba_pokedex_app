import { useEffect, useState } from 'react'

/** True from a pointer-down on the slider until that pointer is released anywhere on the page. */
export function useScrubbing() {
  const [scrubbing, setScrubbing] = useState(false)

  useEffect(() => {
    if (!scrubbing) return
    const stop = () => setScrubbing(false)
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    return () => {
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
    }
  }, [scrubbing])

  return [scrubbing, setScrubbing] as const
}
