import { useId, useRef, type CSSProperties } from 'react'
import type { StatAdjustments } from '../data'
import { usePinnableHover } from '../hooks/usePinnableHover'
import { adjustmentLines, formatDelta } from '../lib/adjustments'
import './AdjustmentNotice.css'

/**
 * A small "Adjusted" chip for players whose stats were changed by hand.
 * Hover (mouse) or tap it to see each change, e.g. "SPD +20".
 */
export function AdjustmentNotice({ adjustments }: { adjustments: StatAdjustments }) {
  const popoverId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const { active, triggerProps } = usePinnableHover<'adjustments'>(rootRef)
  const open = active === 'adjustments'
  const lines = adjustmentLines(adjustments)
  const summary = lines.map(({ label, delta }) => `${label} ${formatDelta(delta)}`).join(', ')

  return (
    <div className="adjustments" ref={rootRef}>
      <button
        type="button"
        className="adjustments-chip"
        aria-expanded={open}
        aria-describedby={open ? popoverId : undefined}
        aria-label={`Stats adjusted by hand: ${summary}`}
        {...triggerProps('adjustments')}
      >
        <span aria-hidden="true">✎</span> Adjusted
      </button>
      {open && (
        <div id={popoverId} className="adjustments-popover" role="tooltip">
          <p className="adjustments-title">Manual adjustments</p>
          <ul className="adjustments-lines">
            {lines.map(({ key, label, token, delta }) => (
              <li
                key={key}
                className="adjustments-line"
                style={{ '--pill': `var(--stat-${token})`, '--pill-text': `var(--stat-${token}-text)` } as CSSProperties}
              >
                <span className="adjustments-stat">{label}</span>
                <span className="adjustments-delta">{formatDelta(delta)}</span>
              </li>
            ))}
          </ul>
          <p className="adjustments-total">
            BST <span className="adjustments-delta">{formatDelta(adjustments.baseStatTotal)}</span>
          </p>
          <p className="adjustments-note">The stats shown include these changes.</p>
        </div>
      )}
    </div>
  )
}
