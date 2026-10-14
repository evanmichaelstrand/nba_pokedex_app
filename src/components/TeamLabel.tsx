import { useState, type CSSProperties } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { teamLogoUrl } from '../lib/images'
import { getTeam } from '../lib/teams'
import './TeamLabel.css'

interface TeamLabelProps {
  abbreviation: string
  size?: 'large' | 'small'
}

/** Team logo + name (just the nickname on phones, to save width). Falls back to a team-color dot if the logo is unknown or fails to load. */
export function TeamLabel({ abbreviation, size = 'large' }: TeamLabelProps) {
  const team = getTeam(abbreviation)
  const logo = teamLogoUrl(abbreviation)
  const [failedLogo, setFailedLogo] = useState<string | null>(null)
  const showLogo = logo !== null && failedLogo !== logo
  const narrow = useMediaQuery('(max-width: 639px)')

  return (
    <span className="team-label" data-size={size} style={{ '--team-color': team.color } as CSSProperties}>
      {showLogo ? (
        // Decorative: the team name is right next to it.
        <img className="team-label-logo" src={logo} alt="" onError={() => setFailedLogo(logo)} />
      ) : (
        <span className="team-label-dot" aria-hidden="true" />
      )}
      {narrow ? team.nickname : team.name}
    </span>
  )
}
