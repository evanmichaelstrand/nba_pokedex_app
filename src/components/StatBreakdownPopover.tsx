import { formatPercentile, type StatBreakdown } from '../lib/statBreakdown'
import './StatBreakdownPopover.css'

interface StatBreakdownPopoverProps {
  id: string
  title: string
  playerName: string
  breakdown: StatBreakdown
  /** Open above the row (for rows near the bottom of the chart). */
  above: boolean
}

/** How a player's stat was built: the real numbers behind it, with percentiles where available. */
export function StatBreakdownPopover({ id, title, playerName, breakdown, above }: StatBreakdownPopoverProps) {
  return (
    <div id={id} className="breakdown" role="tooltip" data-above={above || undefined}>
      <p className="breakdown-title">
        {title} · {playerName}
      </p>
      <p className="breakdown-summary">{breakdown.summary}</p>
      {breakdown.lines.length > 0 ? (
        <dl className="breakdown-lines">
          {breakdown.lines.map((line) => (
            <div key={line.label} className="breakdown-line">
              <dt>{line.label}</dt>
              <dd>
                <span className="breakdown-value">{line.value}</span>
                {line.percentile !== undefined && (
                  <span className="breakdown-percentile">{formatPercentile(line.percentile)} pct</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="breakdown-summary">No underlying stats available.</p>
      )}
      <p className="breakdown-note">Percentiles are among qualifying players.</p>
    </div>
  )
}
