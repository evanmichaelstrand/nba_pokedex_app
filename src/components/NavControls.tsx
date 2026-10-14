import './NavControls.css'

interface NavControlsProps {
  /** 0-based index of the current entry. */
  index: number
  total: number
  onPrevious: () => void
  onNext: () => void
}

export function NavControls({ index, total, onPrevious, onNext }: NavControlsProps) {
  return (
    <nav className="nav" aria-label="Pokédex navigation">
      <button type="button" className="nav-button" onClick={onPrevious} aria-label="Previous entry">
        <span aria-hidden="true">‹</span>
      </button>
      <p className="nav-position" aria-live="polite" aria-atomic="true">
        <span className="visually-hidden">Entry </span>
        {index + 1} / {total}
      </p>
      <button type="button" className="nav-button" onClick={onNext} aria-label="Next entry">
        <span aria-hidden="true">›</span>
      </button>
    </nav>
  )
}
