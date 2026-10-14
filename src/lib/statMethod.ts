import type { StatLine } from '../data'

export interface StatInput {
  label: string
  /** Share of the stat, in percent. */
  weight: number
}

export interface StatMethod {
  name: string
  inputs: StatInput[]
}

/** How the data pipeline builds each player stat from real NBA numbers (shown in About). */
export const STAT_METHODS: Readonly<Record<keyof StatLine, StatMethod>> = {
  hp: { name: 'HP', inputs: [{ label: 'Total minutes', weight: 100 }] },
  attack: {
    name: 'Attack',
    inputs: [
      { label: 'Points per game', weight: 50 },
      { label: '2-point FG%', weight: 50 },
    ],
  },
  defense: {
    name: 'Defense',
    inputs: [
      { label: 'Interior defensive FG%', weight: 50 },
      { label: 'Rebounds', weight: 30 },
      { label: 'Blocks', weight: 20 },
    ],
  },
  spAttack: {
    name: 'Special Attack',
    inputs: [
      { label: 'Assists − turnovers', weight: 33 },
      { label: '3-pointers made', weight: 33 },
      { label: 'Net offensive rating', weight: 33 },
    ],
  },
  spDefense: {
    name: 'Special Defense',
    inputs: [
      { label: 'Perimeter defensive FG%', weight: 50 },
      { label: 'Net defensive rating', weight: 30 },
      { label: 'Steals', weight: 20 },
    ],
  },
  speed: {
    name: 'Speed',
    inputs: [
      { label: 'Average game speed', weight: 30 },
      { label: 'Loose balls recovered', weight: 30 },
      { label: 'Charges taken', weight: 30 },
      { label: 'Box outs', weight: 10 },
    ],
  },
}
