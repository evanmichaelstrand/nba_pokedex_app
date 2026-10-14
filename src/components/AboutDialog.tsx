import { useId, useRef, type CSSProperties, type MouseEvent } from 'react'
import { statSummary } from '../lib/statBreakdown'
import { STAT_METHODS } from '../lib/statMethod'
import { STAT_ROWS } from '../lib/stats'
import './AboutDialog.css'

const CONTACT_EMAIL = 'nbapokedex@gmail.com'

const SOCIALS = [
  { name: 'Instagram', url: 'https://www.instagram.com/nbapokedex/' },
  { name: 'TikTok', url: 'https://www.tiktok.com/@nbapokedex' },
  { name: 'YouTube', url: 'https://www.youtube.com/@nbapokedex' },
]

const DRAWBACKS = [
  'NBA player value is often disproportionately skewed toward offensive contribution, while Pokémon-style stats force a player’s BST to be made up of offense and defense in essentially equal parts.',
  'Many stat categories have room for improvement in how much statistical context they include.',
  'Percentile analysis is applied to statistics whose distributions aren’t uniform, which is not ideal but is common practice.',
]

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
          <p className="about-socials">
            @nbapokedex on{' '}
            {SOCIALS.map(({ name, url }, i) => (
              <span key={name}>
                {i > 0 && (i === SOCIALS.length - 1 ? ', and ' : ', ')}
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {name}
                </a>
              </span>
            ))}
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
          <section className="about-section">
            <h3 className="about-section-title">Adjustments</h3>
            <p>
              Although many of the results are unadjusted from the initial algorithm result, some manual adjustments
              have been applied to better match player perception with their respective image and skill, and to
              facilitate a better Pokémon match. For example, the algorithm gives Donte DiVincenzo the BST of a
              pseudo-legendary, while Anthony Edwards’ is closer to a fully evolved starter. Adjustments have been made
              to facilitate matches that respect the perception of their power levels. The “Adjusted” notice on a
              player’s card serves to provide full transparency.
            </p>
          </section>
          <section className="about-section">
            <h3 className="about-section-title">Drawbacks</h3>
            <p>Many algorithmic drawbacks may lead to unexpected results:</p>
            <ul className="about-drawbacks">
              {DRAWBACKS.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </section>
          <p className="about-section about-contact">
            For feedback, ideas, and inquiries, please contact me at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </div>
      </dialog>
    </>
  )
}
