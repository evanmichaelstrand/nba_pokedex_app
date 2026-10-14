import { useEffect } from 'react'

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

/** Keys pressed inside an open dialog (e.g. About) belong to it, not to the deck behind it. */
function isInOpenDialog(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('dialog[open]') !== null
}

/** Calls onPrevious / onNext for ← / →, except while typing in a form field or using a dialog. */
export function useArrowKeys(onPrevious: () => void, onNext: () => void) {
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (isTypingTarget(event.target) || isInOpenDialog(event.target)) return
      if (event.key === 'ArrowLeft') onPrevious()
      else if (event.key === 'ArrowRight') onNext()
      else return
      event.preventDefault()
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [onPrevious, onNext])
}
