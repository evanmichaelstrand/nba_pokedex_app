import { formatMatchPercent } from '../lib/format'
import { gaugeAngle } from '../lib/gauge'
import './MatchGauge.css'

const RADIUS = 38
const NEEDLE_LENGTH = 34

/** Match quality as a semicircle gauge with a needle, like the @nbapokedex posts, plus the exact percent. */
export function MatchGauge({ fraction }: { fraction: number }) {
  return (
    <div className="match-gauge">
      <svg className="match-gauge-dial" viewBox="-48 -46 96 52" aria-hidden="true">
        <path className="match-gauge-arc" d={`M ${-RADIUS} 0 A ${RADIUS} ${RADIUS} 0 0 1 ${RADIUS} 0`} />
        <g className="match-gauge-needle" transform={`rotate(${gaugeAngle(fraction)})`}>
          <polygon points={`-3.5,0 0,${-NEEDLE_LENGTH} 3.5,0`} />
          <circle r={5} />
        </g>
      </svg>
      <p className="match-gauge-text">
        <span className="match-gauge-value">{formatMatchPercent(fraction)}</span>
        <span className="match-gauge-label">match quality</span>
      </p>
    </div>
  )
}
