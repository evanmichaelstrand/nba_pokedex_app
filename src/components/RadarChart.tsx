import type { CSSProperties } from 'react'
import type { StatLine } from '../data'
import { axisPoint, RADAR_AXES, radarPolygon, ringPolygon } from '../lib/radar'
import './RadarChart.css'

interface RadarChartProps {
  playerName: string
  pokemonName: string
  playerStats: StatLine
  pokemonStats: StatLine
  playerColor: string
  pokemonColor: string
  scaleMax: number
}

const RADIUS = 78
/** Labeled guide rings, like the posts' 50 / 100 / 150. */
const RING_STEP = 50
const LABEL_OFFSET = 20
/** Approximate width of one Courier Prime character at the label size, for sizing label pills. */
const CHAR_WIDTH = 6.6

/** Both stat lines overlaid on a hexagon, axes labeled with stat-colored pills. */
export function RadarChart(props: RadarChartProps) {
  const { playerName, pokemonName, playerStats, pokemonStats, scaleMax } = props
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
      <svg
        className="radar-svg"
        viewBox="-135 -112 270 224"
        role="img"
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
          return (
            <g key={key} transform={`translate(${x} ${y})`}>
              <rect className="radar-pill" x={-width / 2} y={-9} width={width} height={18} rx={9} style={{ fill: `var(--stat-${token})` }} />
              <text className="radar-label" textAnchor="middle" dominantBaseline="central" style={{ fill: `var(--stat-${token}-text)` }}>
                {label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
