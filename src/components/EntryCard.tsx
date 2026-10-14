import { Fragment, type CSSProperties } from 'react'
import { SEASON } from '../config'
import type { Entry } from '../data'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { formatDexNumber, formatMatchPercent, formatPokemonName } from '../lib/format'
import { playerHeadshotUrls, pokemonSpriteUrls } from '../lib/images'
import { getTeam } from '../lib/teams'
import { FallbackImage } from './FallbackImage'
import { StatBars } from './StatBars'
import { TeamLabel } from './TeamLabel'
import { TypeBadge } from './TypeBadge'
import './EntryCard.css'

interface EntryCardProps {
  entry: Entry
  statScaleMax: number
  /** Hold off on loading images (while scrubbing). */
  deferImages?: boolean
}

export function EntryCard({ entry, statScaleMax, deferImages = false }: EntryCardProps) {
  const { player, pokemon } = entry
  const team = getTeam(player.mainTeam)
  const pokemonName = formatPokemonName(pokemon.name)
  const dexNumber = formatDexNumber(pokemon.id)
  const animated = !useMediaQuery('(prefers-reduced-motion: reduce)')

  return (
    <article
      className="entry"
      aria-label={`${player.name}: ${pokemonName}`}
      style={{ '--team-color': team.color } as CSSProperties}
    >
      <div className="entry-matchup">
        <section className="entry-side">
          <div className="entry-image-frame entry-image-frame-player">
            <FallbackImage
              className="entry-image"
              deferred={deferImages}
              sources={playerHeadshotUrls(entry.id, [player.mainTeam, ...player.otherTeams], SEASON?.startYear ?? null)}
              alt={`${player.name} headshot`}
              width={1040}
              height={760}
            />
          </div>
          <h2 className="entry-name">{player.name}</h2>
          <p className="entry-team">
            <TeamLabel abbreviation={player.mainTeam} />
          </p>
          {player.otherTeams.length > 0 && (
            <p className="entry-detail">
              Also played for:{' '}
              {player.otherTeams.map((abbr, i) => (
                <Fragment key={abbr}>
                  {i > 0 && ', '}
                  <TeamLabel abbreviation={abbr} size="small" />
                </Fragment>
              ))}
            </p>
          )}
        </section>

        <section className="entry-side">
          <div className="entry-image-frame">
            <FallbackImage
              className="entry-image"
              deferred={deferImages}
              sources={pokemonSpriteUrls(pokemon.id, animated)}
              alt={`${pokemonName} artwork`}
              width={475}
              height={475}
            />
          </div>
          <h2 className="entry-name">{pokemonName}</h2>
          <div className="entry-pokemon-meta">
            {dexNumber && <span className="entry-detail">{dexNumber}</span>}
            <TypeBadge type={pokemon.primaryType} />
            {pokemon.secondaryType && <TypeBadge type={pokemon.secondaryType} />}
          </div>
        </section>
      </div>

      <p className="entry-match">
        <span className="entry-match-value">{formatMatchPercent(entry.matchPercentage)}</span> match
      </p>

      <StatBars
        playerName={player.name}
        pokemonName={pokemonName}
        playerStats={player.stats}
        pokemonStats={pokemon.stats}
        playerTotal={player.baseStatTotal}
        pokemonTotal={pokemon.baseStatTotal}
        scaleMax={statScaleMax}
      />
    </article>
  )
}
