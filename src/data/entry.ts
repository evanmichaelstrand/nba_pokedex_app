/** The six Pokémon-style stats, shared by players and Pokémon. */
export interface StatLine {
  hp: number
  attack: number
  defense: number
  spAttack: number
  spDefense: number
  speed: number
}

export interface Player {
  name: string
  /** Team abbreviation, e.g. "DEN". */
  mainTeam: string
  /** Other team abbreviations this season; usually empty. */
  otherTeams: string[]
  /** Not produced by the pipeline yet. */
  position?: string
  stats: StatLine
  baseStatTotal: number
  /** Manual changes already applied to `stats`; absent when the player has none. */
  statAdjustments?: StatAdjustments
}

/** How much each stat was changed by hand (adjusted − original); positive means raised. */
export interface StatAdjustments {
  stats: StatLine
  baseStatTotal: number
}

export interface Pokemon {
  /** PokéAPI ID; above 10000 for alternate forms. */
  id: number
  /** PokéAPI-style slug, e.g. "tyranitar-mega". */
  name: string
  primaryType: string
  secondaryType?: string
  stats: StatLine
  baseStatTotal: number
}

/** The real numbers behind the player's stats. Any field may be unavailable. */
export interface RealStats {
  heightIn?: number
  weightLb?: number
  age?: number
  gamesPlayed?: number
  minutesPerGame?: number
  totalMinutes?: number
  pointsPerGame?: number
  trueShootingPct?: number
  fg2Pct?: number
  fg2Attempts?: number
  fg3Pct?: number
  fg3Attempts?: number
  onBallDefFgPct?: number
  interiorDefFgPct?: number
  perimeterDefFgPct?: number
  avgSpeedMph?: number
  blocks?: number
  rebounds?: number
  assists?: number
  turnovers?: number
  steals?: number
  netOffRating?: number
  netDefRating?: number
  chargesDrawn?: number
  looseBallsRecovered?: number
  boxOuts?: number
  /** Percentile (0–100) among qualifying players, keyed by input name, e.g. "ppg", "fg2Pct". */
  percentiles: Record<string, number>
}

export interface Entry {
  /** NBA.com player ID; the entry's identity everywhere. */
  id: number
  player: Player
  pokemon: Pokemon
  /** 0–1, higher is closer. */
  matchPercentage: number
  realStats: RealStats
}
