import './FilterChip.css'

interface FilterChipProps {
  query: string
  onClear: () => void
}

/** Shows that the deck is narrowed by a search, with a one-tap way out. */
export function FilterChip({ query, onClear }: FilterChipProps) {
  return (
    <span className="filter-chip">
      <span className="filter-chip-text">
        Filtered: “<span className="filter-chip-query">{query.trim()}</span>”
      </span>
      <button type="button" className="filter-chip-clear" aria-label="Clear search" onClick={onClear}>
        <span aria-hidden="true">✕</span>
      </button>
    </span>
  )
}
