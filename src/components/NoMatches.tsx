import './StatusMessage.css'

interface NoMatchesProps {
  query: string
  onClear: () => void
}

export function NoMatches({ query, onClear }: NoMatchesProps) {
  return (
    <div className="status" role="status">
      <p className="status-title">No matches</p>
      <p className="status-detail">Nothing in the Pokédex matches “{query.trim()}”.</p>
      <button type="button" className="status-button" onClick={onClear}>
        Clear search
      </button>
    </div>
  )
}
