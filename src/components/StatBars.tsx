import type { StatLine } from '../data'
import { barPercent, STAT_ROWS } from '../lib/stats'
import './StatBars.css'

interface StatBarsProps {
  playerName: string
  pokemonName: string
  playerStats: StatLine
  pokemonStats: StatLine
  playerTotal: number
  pokemonTotal: number
  /** Shared scale for both sides so the comparison is honest. */
  scaleMax: number
}

function Bar({ value, scaleMax, side }: { value: number; scaleMax: number; side: 'player' | 'pokemon' }) {
  return (
    <div className={`stat-bar stat-bar-${side}`}>
      <div className="stat-track">
        <div className="stat-fill" style={{ width: `${barPercent(value, scaleMax)}%` }} />
      </div>
      <span className="stat-value">{value}</span>
    </div>
  )
}

export function StatBars(props: StatBarsProps) {
  const { playerName, pokemonName, playerStats, pokemonStats, scaleMax } = props
  return (
    <section className="stats" aria-label="Stats">
      <div className="stats-legend" aria-hidden="true">
        <span className="stats-key stats-key-player">
          <span className="stats-key-name">{playerName}</span>
        </span>
        <span className="stats-key stats-key-pokemon">
          <span className="stats-key-name">{pokemonName}</span>
        </span>
      </div>
      <ul className="stats-rows">
        {STAT_ROWS.map(({ key, label }) => (
          <li
            key={key}
            className="stat-row"
            aria-label={`${label}: ${playerName} ${playerStats[key]}, ${pokemonName} ${pokemonStats[key]}`}
          >
            <span className="stat-label" aria-hidden="true">
              {label}
            </span>
            <div className="stat-bars" aria-hidden="true">
              <Bar value={playerStats[key]} scaleMax={scaleMax} side="player" />
              <Bar value={pokemonStats[key]} scaleMax={scaleMax} side="pokemon" />
            </div>
          </li>
        ))}
      </ul>
      <p className="stats-total">
        <span className="stat-label">TOTAL</span>
        <span className="stats-total-value stats-key-player">{props.playerTotal}</span>
        <span className="stats-total-vs">vs</span>
        <span className="stats-total-value stats-key-pokemon">{props.pokemonTotal}</span>
      </p>
    </section>
  )
}
