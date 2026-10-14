export interface Team {
  abbreviation: string
  name: string
  /** Primary team color, used as an accent. */
  color: string
  /** NBA.com team ID (used for logos and season headshots); undefined for unknown teams. */
  id?: number
}

const FALLBACK_COLOR = '#5c5c5c'

const TEAMS: Readonly<Record<string, Omit<Team, 'abbreviation'>>> = {
  ATL: { name: 'Atlanta Hawks', color: '#e03a3e', id: 1610612737 },
  BKN: { name: 'Brooklyn Nets', color: '#000000', id: 1610612751 },
  BOS: { name: 'Boston Celtics', color: '#007a33', id: 1610612738 },
  CHA: { name: 'Charlotte Hornets', color: '#1d1160', id: 1610612766 },
  CHI: { name: 'Chicago Bulls', color: '#ce1141', id: 1610612741 },
  CLE: { name: 'Cleveland Cavaliers', color: '#860038', id: 1610612739 },
  DAL: { name: 'Dallas Mavericks', color: '#00538c', id: 1610612742 },
  DEN: { name: 'Denver Nuggets', color: '#0e2240', id: 1610612743 },
  DET: { name: 'Detroit Pistons', color: '#c8102e', id: 1610612765 },
  GSW: { name: 'Golden State Warriors', color: '#1d428a', id: 1610612744 },
  HOU: { name: 'Houston Rockets', color: '#ce1141', id: 1610612745 },
  IND: { name: 'Indiana Pacers', color: '#002d62', id: 1610612754 },
  LAC: { name: 'LA Clippers', color: '#c8102e', id: 1610612746 },
  LAL: { name: 'Los Angeles Lakers', color: '#552583', id: 1610612747 },
  MEM: { name: 'Memphis Grizzlies', color: '#5d76a9', id: 1610612763 },
  MIA: { name: 'Miami Heat', color: '#98002e', id: 1610612748 },
  MIL: { name: 'Milwaukee Bucks', color: '#00471b', id: 1610612749 },
  MIN: { name: 'Minnesota Timberwolves', color: '#0c2340', id: 1610612750 },
  NOP: { name: 'New Orleans Pelicans', color: '#0c2340', id: 1610612740 },
  NYK: { name: 'New York Knicks', color: '#006bb6', id: 1610612752 },
  OKC: { name: 'Oklahoma City Thunder', color: '#007ac1', id: 1610612760 },
  ORL: { name: 'Orlando Magic', color: '#0077c0', id: 1610612753 },
  PHI: { name: 'Philadelphia 76ers', color: '#006bb6', id: 1610612755 },
  PHX: { name: 'Phoenix Suns', color: '#1d1160', id: 1610612756 },
  POR: { name: 'Portland Trail Blazers', color: '#e03a3e', id: 1610612757 },
  SAC: { name: 'Sacramento Kings', color: '#5a2d81', id: 1610612758 },
  SAS: { name: 'San Antonio Spurs', color: '#000000', id: 1610612759 },
  TOR: { name: 'Toronto Raptors', color: '#ce1141', id: 1610612761 },
  UTA: { name: 'Utah Jazz', color: '#002b5c', id: 1610612762 },
  WAS: { name: 'Washington Wizards', color: '#002b5c', id: 1610612764 },
}

/** Looks up a team by abbreviation. Unknown abbreviations come back as-is with a neutral color and no ID. */
export function getTeam(abbreviation: string): Team {
  const known = TEAMS[abbreviation.toUpperCase()]
  return known
    ? { abbreviation: abbreviation.toUpperCase(), ...known }
    : { abbreviation, name: abbreviation, color: FALLBACK_COLOR }
}
