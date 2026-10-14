export interface Team {
  abbreviation: string
  name: string
  /** Name without the city (e.g. "Lakers"), for tight layouts. */
  nickname: string
  /** Primary team color, used as an accent. */
  color: string
  /** NBA.com team ID (used for logos and season headshots); undefined for unknown teams. */
  id?: number
}

const FALLBACK_COLOR = '#5c5c5c'

const TEAMS: Readonly<Record<string, Omit<Team, 'abbreviation'>>> = {
  ATL: { name: 'Atlanta Hawks', nickname: 'Hawks', color: '#e03a3e', id: 1610612737 },
  BKN: { name: 'Brooklyn Nets', nickname: 'Nets', color: '#000000', id: 1610612751 },
  BOS: { name: 'Boston Celtics', nickname: 'Celtics', color: '#007a33', id: 1610612738 },
  CHA: { name: 'Charlotte Hornets', nickname: 'Hornets', color: '#1d1160', id: 1610612766 },
  CHI: { name: 'Chicago Bulls', nickname: 'Bulls', color: '#ce1141', id: 1610612741 },
  CLE: { name: 'Cleveland Cavaliers', nickname: 'Cavaliers', color: '#860038', id: 1610612739 },
  DAL: { name: 'Dallas Mavericks', nickname: 'Mavericks', color: '#00538c', id: 1610612742 },
  DEN: { name: 'Denver Nuggets', nickname: 'Nuggets', color: '#0e2240', id: 1610612743 },
  DET: { name: 'Detroit Pistons', nickname: 'Pistons', color: '#c8102e', id: 1610612765 },
  GSW: { name: 'Golden State Warriors', nickname: 'Warriors', color: '#1d428a', id: 1610612744 },
  HOU: { name: 'Houston Rockets', nickname: 'Rockets', color: '#ce1141', id: 1610612745 },
  IND: { name: 'Indiana Pacers', nickname: 'Pacers', color: '#002d62', id: 1610612754 },
  LAC: { name: 'LA Clippers', nickname: 'Clippers', color: '#c8102e', id: 1610612746 },
  LAL: { name: 'Los Angeles Lakers', nickname: 'Lakers', color: '#552583', id: 1610612747 },
  MEM: { name: 'Memphis Grizzlies', nickname: 'Grizzlies', color: '#5d76a9', id: 1610612763 },
  MIA: { name: 'Miami Heat', nickname: 'Heat', color: '#98002e', id: 1610612748 },
  MIL: { name: 'Milwaukee Bucks', nickname: 'Bucks', color: '#00471b', id: 1610612749 },
  MIN: { name: 'Minnesota Timberwolves', nickname: 'Timberwolves', color: '#0c2340', id: 1610612750 },
  NOP: { name: 'New Orleans Pelicans', nickname: 'Pelicans', color: '#0c2340', id: 1610612740 },
  NYK: { name: 'New York Knicks', nickname: 'Knicks', color: '#006bb6', id: 1610612752 },
  OKC: { name: 'Oklahoma City Thunder', nickname: 'Thunder', color: '#007ac1', id: 1610612760 },
  ORL: { name: 'Orlando Magic', nickname: 'Magic', color: '#0077c0', id: 1610612753 },
  PHI: { name: 'Philadelphia 76ers', nickname: '76ers', color: '#006bb6', id: 1610612755 },
  PHX: { name: 'Phoenix Suns', nickname: 'Suns', color: '#1d1160', id: 1610612756 },
  POR: { name: 'Portland Trail Blazers', nickname: 'Trail Blazers', color: '#e03a3e', id: 1610612757 },
  SAC: { name: 'Sacramento Kings', nickname: 'Kings', color: '#5a2d81', id: 1610612758 },
  SAS: { name: 'San Antonio Spurs', nickname: 'Spurs', color: '#000000', id: 1610612759 },
  TOR: { name: 'Toronto Raptors', nickname: 'Raptors', color: '#ce1141', id: 1610612761 },
  UTA: { name: 'Utah Jazz', nickname: 'Jazz', color: '#002b5c', id: 1610612762 },
  WAS: { name: 'Washington Wizards', nickname: 'Wizards', color: '#002b5c', id: 1610612764 },
}

/** Looks up a team by abbreviation. Unknown abbreviations come back as-is with a neutral color and no ID. */
export function getTeam(abbreviation: string): Team {
  const known = TEAMS[abbreviation.toUpperCase()]
  return known
    ? { abbreviation: abbreviation.toUpperCase(), ...known }
    : { abbreviation, name: abbreviation, nickname: abbreviation, color: FALLBACK_COLOR }
}
