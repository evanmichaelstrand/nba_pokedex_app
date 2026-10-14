export interface Team {
  abbreviation: string
  name: string
  /** Primary team color, used as an accent. */
  color: string
}

const FALLBACK_COLOR = '#5c5c5c'

const TEAMS: Readonly<Record<string, Omit<Team, 'abbreviation'>>> = {
  ATL: { name: 'Atlanta Hawks', color: '#e03a3e' },
  BKN: { name: 'Brooklyn Nets', color: '#000000' },
  BOS: { name: 'Boston Celtics', color: '#007a33' },
  CHA: { name: 'Charlotte Hornets', color: '#1d1160' },
  CHI: { name: 'Chicago Bulls', color: '#ce1141' },
  CLE: { name: 'Cleveland Cavaliers', color: '#860038' },
  DAL: { name: 'Dallas Mavericks', color: '#00538c' },
  DEN: { name: 'Denver Nuggets', color: '#0e2240' },
  DET: { name: 'Detroit Pistons', color: '#c8102e' },
  GSW: { name: 'Golden State Warriors', color: '#1d428a' },
  HOU: { name: 'Houston Rockets', color: '#ce1141' },
  IND: { name: 'Indiana Pacers', color: '#002d62' },
  LAC: { name: 'LA Clippers', color: '#c8102e' },
  LAL: { name: 'Los Angeles Lakers', color: '#552583' },
  MEM: { name: 'Memphis Grizzlies', color: '#5d76a9' },
  MIA: { name: 'Miami Heat', color: '#98002e' },
  MIL: { name: 'Milwaukee Bucks', color: '#00471b' },
  MIN: { name: 'Minnesota Timberwolves', color: '#0c2340' },
  NOP: { name: 'New Orleans Pelicans', color: '#0c2340' },
  NYK: { name: 'New York Knicks', color: '#006bb6' },
  OKC: { name: 'Oklahoma City Thunder', color: '#007ac1' },
  ORL: { name: 'Orlando Magic', color: '#0077c0' },
  PHI: { name: 'Philadelphia 76ers', color: '#006bb6' },
  PHX: { name: 'Phoenix Suns', color: '#1d1160' },
  POR: { name: 'Portland Trail Blazers', color: '#e03a3e' },
  SAC: { name: 'Sacramento Kings', color: '#5a2d81' },
  SAS: { name: 'San Antonio Spurs', color: '#000000' },
  TOR: { name: 'Toronto Raptors', color: '#ce1141' },
  UTA: { name: 'Utah Jazz', color: '#002b5c' },
  WAS: { name: 'Washington Wizards', color: '#002b5c' },
}

/** Looks up a team by abbreviation. Unknown abbreviations come back as-is with a neutral color. */
export function getTeam(abbreviation: string): Team {
  const known = TEAMS[abbreviation.toUpperCase()]
  return known
    ? { abbreviation: abbreviation.toUpperCase(), ...known }
    : { abbreviation, name: abbreviation, color: FALLBACK_COLOR }
}
