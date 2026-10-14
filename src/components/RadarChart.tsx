import { useId, useRef, type CSSProperties } from 'react'
import type { RealStats, StatLine } from '../data'
import { usePinnableHover } from '../hooks/usePinnableHover'
import { axisPoint, RADAR_AXES, radarPolygon, ringPolygon } from '../lib/radar'
import { statBreakdown } from '../lib/statBreakdown'
import { StatBreakdownPopover } from './StatBreakdownPopover'
import './RadarChart.css'

interface RadarChartProps {
  playerName: string
  pokemonName: string
  playerStats: StatLine
  pokemonStats: StatLine
  playerColor: string
  pokemonColor: string
  scaleMax: number
  /** The player's real numbers, shown when a stat label is hovered or tapped. */
  realStats: RealStats
}

const RADIUS = 78
/** Labeled guide rings, like the posts' 50 / 100 / 150. */
const RING_STEP = 50
const LABEL_OFFSET = 20
/** Approximate width of one Courier Prime character at the label size, for sizing label pills. */
const CHAR_WIDTH = 6.6
/** The SVG viewBox; a label's y is converted to a percentage of its height to place breakdowns. */
const VIEW = { x: -135, y: -112, width: 270, height: 224 }

/**
 * Both stat lines overlaid on a hexagon, axes labeled with stat-colored pills.
 * Hover (mouse) or tap a label to see the real numbers behind the player's value.
 */
export function RadarChart(props: RadarChartProps) {
  const { playerName, pokemonName, playerStats, pokemonStats, scaleMax, realStats } = props
  const idPrefix = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const { active, triggerProps } = usePinnableHover<keyof StatLine>(rootRef)
  const activeAxis = RADAR_AXES.findIndex(({ key }) => key === active)
  const rings: number[] = []
  for (let v = RING_STEP; v < scaleMax; v += RING_STEP) rings.push(v)

  const summary = RADAR_AXES.map(({ key, label }) => `${label} ${playerStats[key]} vs ${pokemonStats[key]}`).join(', ')

  return (
    <div className="radar">
      <div className="radar-legend" aria-hidden="true">
        <span className="radar-key" style={{ '--key': props.playerColor } as CSSProperties}>
          {playerName}
        </span>
        <span className="radar-key" style={{ '--key': props.pokemonColor } as CSSProperties}>
          {pokemonName}
        </span>
      </div>
      <div className="radar-plot" ref={rootRef}>
        <svg
          className="radar-svg"
          viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}`}
          role="group"
          aria-label={`Stat radar, ${playerName} vs ${pokemonName}: ${summary}`}
        >
          <polygon className="radar-ring radar-ring-outer" points={ringPolygon(RADIUS)} />
          {rings.map((v) => (
            <g key={v}>
              <polygon className="radar-ring" points={ringPolygon((v / scaleMax) * RADIUS)} />
              <text className="radar-tick" x={2} y={-(v / scaleMax) * RADIUS - 2}>
                {v}
              </text>
            </g>
          ))}
          {RADAR_AXES.map((_, axis) => {
            const end = axisPoint(axis, RADIUS)
            return <line key={axis} className="radar-axis" x1={0} y1={0} x2={end.x} y2={end.y} />
          })}
          <polygon className="radar-shape" points={radarPolygon(playerStats, scaleMax, RADIUS)} style={{ '--shape': props.playerColor } as CSSProperties} />
          <polygon className="radar-shape" points={radarPolygon(pokemonStats, scaleMax, RADIUS)} style={{ '--shape': props.pokemonColor } as CSSProperties} />
          {RADAR_AXES.map(({ key, label, token }, axis) => {
            const { x, y } = axisPoint(axis, RADIUS + LABEL_OFFSET)
            const width = label.length * CHAR_WIDTH + 12
            const open = active === key
            return (
              <g
                key={key}
                className="radar-label-button"
                transform={`translate(${x} ${y})`}
                role="button"
                tabIndex={0}
                aria-expanded={open}
                aria-describedby={open ? `${idPrefix}-${key}` : undefined}
                aria-label={`${label}: ${playerName} ${playerStats[key]}, ${pokemonName} ${pokemonStats[key]}. Show how ${label} is calculated`}
                {...triggerProps(key)}
              >
                <rect className="radar-pill" x={-width / 2} y={-9} width={width} height={18} rx={9} style={{ fill: `var(--stat-${token})` }} />
                <text className="radar-label" textAnchor="middle" dominantBaseline="central" style={{ fill: `var(--stat-${token}-text)` }}>
                  {label}
                </text>
              </g>
            )
          })}
        </svg>
        {activeAxis >= 0 && (
          <RadarBreakdown
            axis={activeAxis}
            id={`${idPrefix}-${RADAR_AXES[activeAxis].key}`}
            playerName={playerName}
            realStats={realStats}
          />
        )}
      </div>
    </div>
  )
}

interface RadarBreakdownProps {
  axis: number
  id: string
  playerName: string
  realStats: RealStats
}

/**
 * A stat's breakdown, next to its label. Only the top label opens downward: the radar sits at the
 * bottom of the card, so the others open upward to stay on it.
 */
function RadarBreakdown({ axis, id, playerName, realStats }: RadarBreakdownProps) {
  const { key, label, token } = RADAR_AXES[axis]
  const { y } = axisPoint(axis, RADIUS + LABEL_OFFSET)
  const above = axis !== 0
  return (
    <div
      className="radar-breakdown-anchor"
      style={{ top: `${((y - VIEW.y) / VIEW.height) * 100}%`, '--bar': `var(--stat-${token})` } as CSSProperties}
    >
      <StatBreakdownPopover id={id} title={label} playerName={playerName} breakdown={statBreakdown(key, realStats)} above={above} />
    </div>
  )
}
