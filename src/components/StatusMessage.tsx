import './StatusMessage.css'

export function LoadingMessage() {
  return (
    <div className="status" role="status">
      <div className="status-spinner" aria-hidden="true" />
      <p>Loading the Pokédex…</p>
    </div>
  )
}

interface ErrorMessageProps {
  onRetry: () => void
}

export function ErrorMessage({ onRetry }: ErrorMessageProps) {
  return (
    <div className="status" role="alert">
      <p className="status-title">Couldn’t load the Pokédex</p>
      <p className="status-detail">Check your connection and try again.</p>
      <button type="button" className="status-button" onClick={onRetry}>
        Try again
      </button>
    </div>
  )
}
