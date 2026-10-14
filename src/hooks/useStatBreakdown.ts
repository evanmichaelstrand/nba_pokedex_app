import { useEffect, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react'
import type { StatLine } from '../data'

type StatKey = keyof StatLine

/**
 * Which stat's breakdown is open in a chart. A tap/click pins one open; mouse hover shows one while
 * pointing. A pinned breakdown closes on a tap outside `rootRef`, on Escape, or on clicking it again.
 */
export function useStatBreakdown(rootRef: RefObject<Element | null>) {
  const [pinned, setPinned] = useState<StatKey | null>(null)
  const [hovered, setHovered] = useState<StatKey | null>(null)

  useEffect(() => {
    if (!pinned) return
    const closeOutside = (event: globalThis.PointerEvent) => {
      if (!(event.target instanceof Node) || !rootRef.current?.contains(event.target)) setPinned(null)
    }
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setPinned(null)
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [pinned, rootRef])

  // Clicking the pinned stat closes it outright, even while still hovered.
  const toggle = (key: StatKey) => {
    if (pinned === key) {
      setPinned(null)
      setHovered(null)
    } else {
      setPinned(key)
    }
  }

  /** Props that make an element the trigger for `key`'s breakdown. */
  const triggerProps = (key: StatKey) => ({
    onClick: () => toggle(key),
    onKeyDown: (event: KeyboardEvent<Element>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        toggle(key)
      } else if (event.key === 'Escape') {
        setPinned(null)
        setHovered(null)
      }
    },
    onPointerEnter: (event: PointerEvent<Element>) => {
      if (event.pointerType === 'mouse') setHovered(key)
    },
    onPointerLeave: (event: PointerEvent<Element>) => {
      if (event.pointerType === 'mouse') setHovered((current) => (current === key ? null : current))
    },
  })

  return { active: pinned ?? hovered, triggerProps }
}
