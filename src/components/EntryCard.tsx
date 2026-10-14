import type { CSSProperties } from 'react'
import type { Entry } from '../data'
import { formatDexNumber, formatMatchPercent, formatPokemonName } from '../lib/format'
import { playerHeadshotUrl, pokemonArtworkUrl } from '../lib/images'
import { getTeam } from '../lib/teams'
import { FallbackImage } from './FallbackImage'
import { StatBars } from './StatBars'
import { TypeBadge } from './TypeBadge'
import './EntryCard.css'

interface EntryCardProps {
  entry: Entry
  statScaleMax: number
}

export function EntryCard({ entry, statScaleMax }: EntryCardProps) {
  const { player, pokemon } = entry
  const team = getTeam(player.mainTeam)
  const otherTeams = player.otherTeams.map((t) => getTeam(t).name)
  const pokemonName = formatPokemonName(pokemon.name)
  const dexNumber = formatDexNumber(pokemon.id)

  return (
    <article className="entry" aria-label={`${player.name}: ${pokemonName}`}>
      <div className="entry-matchup">
        <section className="entry-side" style={{ '--team-color': team.color } as CSSProperties}>
          <div className="entry-image-frame entry-image-frame-player">
            <FallbackImage
              className="entry-image"
              src={playerHeadshotUrl(entry.id)}
              alt={`${player.name} headshot`}
              width={1040}
              height={760}
            />
          </div>
          <h2 className="entry-name">{player.name}</h2>
          <p className="entry-team">{team.name}</p>
          {otherTeams.length > 0 && <p className="entry-detail">Also played for: {otherTeams.join(', ')}</p>}
        </section>

        <section className="entry-side">
          <div className="entry-image-frame">
            <FallbackImage
              className="entry-image"
              src={pokemonArtworkUrl(pokemon.id)}
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
