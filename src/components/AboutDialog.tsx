import { useId, useRef, type CSSProperties, type MouseEvent } from 'react'
import { statSummary } from '../lib/statBreakdown'
import { STAT_METHODS } from '../lib/statMethod'
import { STAT_ROWS } from '../lib/stats'
import './AboutDialog.css'

const CONTACT_EMAIL = 'nbapokedex@gmail.com'

/** An "About" button that opens a dialog explaining how the stats are built. */
export function AboutDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  const close = () => dialogRef.current?.close()
  // A click on the backdrop lands on the <dialog> itself (its content is wrapped in a panel).
  const closeOnBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) close()
  }

  return (
    <>
      <button type="button" className="about-button" onClick={() => dialogRef.current?.showModal()}>
        About
      </button>
      <dialog ref={dialogRef} className="about-dialog" aria-labelledby={titleId} onClick={closeOnBackdrop}>
        <div className="about-panel">
          <div className="about-header">
            <h2 id={titleId} className="about-title">
              About
            </h2>
            <button type="button" className="about-close" aria-label="Close" onClick={close}>
              ✕
            </button>
          </div>
          <p className="about-intro">
            NBA Pokédex assigns Pokémon stats to NBA players and finds their closest match (Gen 1–7) using real NBA
            statistics.
          </p>
          <ul className="about-stats">
            {STAT_ROWS.map(({ key, label, token }) => (
              <li
                key={key}
                className="about-stat"
                style={{ '--pill': `var(--stat-${token})`, '--pill-text': `var(--stat-${token}-text)` } as CSSProperties}
              >
                <h3 className="about-stat-name">
                  <span className="about-pill" aria-hidden="true">
                    {label}
                  </span>
                  {STAT_METHODS[key].name}
                </h3>
                <p className="about-stat-summary">{statSummary(key)}</p>
                <dl className="about-inputs">
                  {STAT_METHODS[key].inputs.map(({ label: input, weight }) => (
                    <div key={input} className="about-input">
                      <dt>{input}</dt>
                      <dd>{weight}%</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
          <p className="about-contact">
            Contact: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </div>
      </dialog>
    </>
  )
}
