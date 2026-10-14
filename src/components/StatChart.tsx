import type { RealStats, StatLine } from '../data'
import type { ChartMode } from '../hooks/useChartMode'
import { ButterflyChart } from './ButterflyChart'
import { RadarChart } from './RadarChart'
import './StatChart.css'

interface StatChartProps {
  mode: ChartMode
  onModeChange: (mode: ChartMode) => void
  playerName: string
  pokemonName: string
  playerStats: StatLine
  pokemonStats: StatLine
  playerTotal: number
  pokemonTotal: number
  /** Series colors for the radar. */
  playerColor: string
  pokemonColor: string
  scaleMax: number
  /** The player's real numbers, for the bar chart's per-stat breakdowns. */
  realStats: RealStats
}

const MODES: ReadonlyArray<{ mode: ChartMode; label: string }> = [
  { mode: 'bars', label: 'Bars' },
  { mode: 'radar', label: 'Radar' },
]

/** The stat comparison, switchable between the butterfly bars and the radar. */
export function StatChart({ mode, onModeChange, ...chart }: StatChartProps) {
  return (
    <section className="stat-chart" aria-label="Stats">
      <div className="stat-chart-toggle" role="group" aria-label="Stat chart style">
        {MODES.map(({ mode: option, label }) => (
          <button
            key={option}
            type="button"
            className="stat-chart-option"
            aria-pressed={mode === option}
            onClick={() => onModeChange(option)}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === 'bars' ? <ButterflyChart {...chart} /> : <RadarChart {...chart} />}
    </section>
  )
}
