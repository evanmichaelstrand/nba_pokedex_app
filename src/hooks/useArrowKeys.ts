import { useEffect } from 'react'

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

/** Calls onPrevious / onNext for ← / →, except while typing in a form field. */
export function useArrowKeys(onPrevious: () => void, onNext: () => void) {
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (isTypingTarget(event.target)) return
      if (event.key === 'ArrowLeft') onPrevious()
      else if (event.key === 'ArrowRight') onNext()
      else return
      event.preventDefault()
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [onPrevious, onNext])
}
