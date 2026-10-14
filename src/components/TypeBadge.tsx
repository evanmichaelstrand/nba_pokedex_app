import { formatTypeName } from '../lib/format'
import { typeColors } from '../lib/pokemonTypes'
import './TypeBadge.css'

export function TypeBadge({ type }: { type: string }) {
  const { background, text } = typeColors(type)
  return (
    <span className="type-badge" style={{ background, color: text }}>
      {formatTypeName(type)}
    </span>
  )
}
