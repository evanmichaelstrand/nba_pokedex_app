import type { ReactNode } from 'react'
import './NavControls.css'

interface NavControlsProps {
  /** 0-based index of the current entry. */
  index: number
  total: number
  onPrevious: () => void
  onNext: () => void
  /** Shown under the position, e.g. the active-filter chip. */
  children?: ReactNode
}

export function NavControls({ index, total, onPrevious, onNext, children }: NavControlsProps) {
  return (
    <nav className="nav" aria-label="Pokédex navigation">
      <button type="button" className="nav-button" onClick={onPrevious} aria-label="Previous entry">
        <span aria-hidden="true">‹</span>
      </button>
      <div className="nav-status">
        <p className="nav-position" aria-live="polite" aria-atomic="true">
          <span className="visually-hidden">Entry </span>
          {index + 1} / {total}
        </p>
        {children}
      </div>
      <button type="button" className="nav-button" onClick={onNext} aria-label="Next entry">
        <span aria-hidden="true">›</span>
      </button>
    </nav>
  )
}
