import { useId, useRef, type CSSProperties } from 'react'
import type { RealStats, StatLine } from '../data'
import { useStatBreakdown } from '../hooks/useStatBreakdown'
import { statBreakdown } from '../lib/statBreakdown'
import { barPercent, STAT_ROWS } from '../lib/stats'
import { StatBreakdownPopover } from './StatBreakdownPopover'
import './ButterflyChart.css'

interface ButterflyChartProps {
  playerName: string
  pokemonName: string
  playerStats: StatLine
  pokemonStats: StatLine
  playerTotal: number
  pokemonTotal: number
  scaleMax: number
  /** The player's real numbers, shown when a row is hovered or tapped. */
  realStats: RealStats
}

/** Values go inside a bar only if it's wide enough to hold them. */
const INSIDE_MIN_PERCENT = 24
/** Rows from this index down open their breakdown upward so it stays on the card. */
const OPEN_ABOVE_FROM = 3

function Bar({ value, scaleMax }: { value: number; scaleMax: number }) {
  const percent = barPercent(value, scaleMax)
  return (
    <div className="butterfly-bar" style={{ width: `${percent}%` }} data-inside={percent >= INSIDE_MIN_PERCENT || undefined}>
      <span className="butterfly-value">{value}</span>
    </div>
  )
}

/**
 * Player stats grow left, Pokémon stats grow right, on one shared scale; each stat in its own color.
 * Hover (mouse) or tap a row to see the real numbers behind the player's value.
 */
export function ButterflyChart(props: ButterflyChartProps) {
  const { playerName, pokemonName, playerStats, pokemonStats, scaleMax, realStats } = props
  const idPrefix = useId()
  const rootRef = useRef<HTMLUListElement>(null)
  const { active, triggerProps } = useStatBreakdown(rootRef)

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
      <ul className="butterfly-rows" ref={rootRef}>
        {STAT_ROWS.map(({ key, label, token }, index) => {
          const open = active === key
          const popoverId = `${idPrefix}-${key}`
          return (
            <li
              key={key}
              className="butterfly-item"
              style={{ '--bar': `var(--stat-${token})`, '--bar-text': `var(--stat-${token}-text)` } as CSSProperties}
            >
              <div
                className="butterfly-row"
                role="button"
                tabIndex={0}
                aria-expanded={open}
                aria-describedby={open ? popoverId : undefined}
                aria-label={`${label}: ${playerName} ${playerStats[key]}, ${pokemonName} ${pokemonStats[key]}. Show how ${label} is calculated`}
                {...triggerProps(key)}
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
              </div>
              {open && (
                <StatBreakdownPopover
                  id={popoverId}
                  title={label}
                  playerName={playerName}
                  breakdown={statBreakdown(key, realStats)}
                  above={index >= OPEN_ABOVE_FROM}
                />
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
