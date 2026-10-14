import { DEFAULT_SORT, isSortKey, SORT_LABELS, type SortKey } from '../lib/sort'
import './SortSelect.css'

interface SortSelectProps {
  value: SortKey
  options: readonly SortKey[]
  onChange: (key: SortKey) => void
}

/**
 * A native <select> (so phones get their own picker) dressed as a compact pill. On narrow screens
 * only the icon shows; the current order is still announced and highlighted when not the default.
 */
export function SortSelect({ value, options, onChange }: SortSelectProps) {
  return (
    <label className="sort" data-active={value !== DEFAULT_SORT || undefined}>
      <span className="sort-icon" aria-hidden="true">
        ⇅
      </span>
      <span className="sort-label" aria-hidden="true">
        {SORT_LABELS[value]}
      </span>
      <select
        className="sort-select"
        aria-label="Sort by"
        value={value}
        onChange={(event) => {
          if (isSortKey(event.target.value)) onChange(event.target.value)
        }}
      >
        {options.map((key) => (
          <option key={key} value={key}>
            {SORT_LABELS[key]}
          </option>
        ))}
      </select>
    </label>
  )
}
