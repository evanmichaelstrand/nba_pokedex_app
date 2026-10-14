import type { CSSProperties } from 'react'
import type { StatLine } from '../data'
import { barPercent, STAT_ROWS } from '../lib/stats'
import './ButterflyChart.css'

interface ButterflyChartProps {
  playerName: string
  pokemonName: string
  playerStats: StatLine
  pokemonStats: StatLine
  playerTotal: number
  pokemonTotal: number
  scaleMax: number
}

/** Values go inside a bar only if it's wide enough to hold them. */
const INSIDE_MIN_PERCENT = 24

function Bar({ value, scaleMax }: { value: number; scaleMax: number }) {
  const percent = barPercent(value, scaleMax)
  return (
    <div className="butterfly-bar" style={{ width: `${percent}%` }} data-inside={percent >= INSIDE_MIN_PERCENT || undefined}>
      <span className="butterfly-value">{value}</span>
    </div>
  )
}

/** Player stats grow left, Pokémon stats grow right, on one shared scale; each stat in its own color. */
export function ButterflyChart(props: ButterflyChartProps) {
  const { playerName, pokemonName, playerStats, pokemonStats, scaleMax } = props
  return (
    <div className="butterfly">
      <div className="butterfly-totals">
        <span className="butterfly-total butterfly-total-player">
          <span className="butterfly-total-name">{playerName}</span>
          <span className="butterfly-total-value">{props.playerTotal}</span>
        </span>
        <span className="butterfly-total">
          <span className="butterfly-total-value">{props.pokemonTotal}</span>
          <span className="butterfly-total-name">{pokemonName}</span>
        </span>
      </div>
      <ul className="butterfly-rows">
        {STAT_ROWS.map(({ key, label, token }) => (
          <li
            key={key}
            className="butterfly-row"
            style={{ '--bar': `var(--stat-${token})`, '--bar-text': `var(--stat-${token}-text)` } as CSSProperties}
            aria-label={`${label}: ${playerName} ${playerStats[key]}, ${pokemonName} ${pokemonStats[key]}`}
          >
            <div className="butterfly-half butterfly-left" aria-hidden="true">
              <Bar value={playerStats[key]} scaleMax={scaleMax} />
            </div>
            <span className="butterfly-label" aria-hidden="true">
              {label}
            </span>
            <div className="butterfly-half butterfly-right" aria-hidden="true">
              <Bar value={pokemonStats[key]} scaleMax={scaleMax} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
