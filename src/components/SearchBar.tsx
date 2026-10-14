import type { FormEvent, KeyboardEvent } from 'react'
import './SearchBar.css'

interface SearchBarProps {
  query: string
  onQueryChange: (query: string) => void
}

export function SearchBar({ query, onQueryChange }: SearchBarProps) {
  // Enter just dismisses the keyboard; results update as you type.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const input = event.currentTarget.elements.namedItem('q')
    if (input instanceof HTMLInputElement) input.blur()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape' && query) {
      event.preventDefault()
      onQueryChange('')
    }
  }

  return (
    <form className="search" role="search" onSubmit={handleSubmit}>
      <label className="visually-hidden" htmlFor="search-input">
        Search players, Pokémon, or teams
      </label>
      <input
        id="search-input"
        name="q"
        className="search-input"
        type="search"
        placeholder="Search"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      {query && (
        <button type="button" className="search-clear" aria-label="Clear search" onClick={() => onQueryChange('')}>
          <span aria-hidden="true">✕</span>
        </button>
      )}
    </form>
  )
}
