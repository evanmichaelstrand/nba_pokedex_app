import { useCallback, useEffect, useRef, useState } from 'react'

/** Returns a callback ref and the attached element's current width in px (0 until measured). */
export function useElementWidth<T extends HTMLElement>() {
  const [width, setWidth] = useState(0)
  const observer = useRef<ResizeObserver | null>(null)

  const ref = useCallback((element: T | null) => {
    observer.current?.disconnect()
    observer.current = null
    if (!element) return
    setWidth(element.offsetWidth)
    observer.current = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.current.observe(element)
  }, [])

  useEffect(() => () => observer.current?.disconnect(), [])

  return [ref, width] as const
}
