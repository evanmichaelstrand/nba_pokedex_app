import { describe, expect, it } from 'vitest'
import { axisPoint, RADAR_AXES, radarPolygon, ringPolygon } from '../../src/lib/radar'

const stats = { hp: 90, attack: 90, defense: 90, spAttack: 90, spDefense: 90, speed: 90 }

describe('RADAR_AXES', () => {
  it('runs clockwise from HP like the posts', () => {
    expect(RADAR_AXES.map((a) => a.key)).toEqual(['hp', 'attack', 'defense', 'speed', 'spDefense', 'spAttack'])
  })
})

describe('axisPoint', () => {
  it('puts axis 0 at the top and goes clockwise', () => {
    expect(axisPoint(0, 10)).toEqual({ x: 0, y: -10 })
    expect(axisPoint(1, 10).x).toBeGreaterThan(0) // upper right
    expect(axisPoint(3, 10)).toEqual({ x: 0, y: 10 }) // bottom
    expect(axisPoint(5, 10).x).toBeLessThan(0) // upper left
  })
})

describe('radarPolygon', () => {
  it('scales values against scaleMax', () => {
    const points = radarPolygon(stats, 180, 100).split(' ')
    expect(points).toHaveLength(6)
    expect(points[0]).toBe('0,-50') // HP 90 of 180 → half the radius, straight up
  })

  it('clamps values outside 0..scaleMax', () => {
    const points = radarPolygon({ ...stats, hp: 400, attack: -5 }, 180, 100).split(' ')
    expect(points[0]).toBe('0,-100')
    expect(points[1]).toBe('0,0')
  })
})

describe('ringPolygon', () => {
  it('draws a regular hexagon', () => {
    expect(ringPolygon(10).split(' ')[0]).toBe('0,-10')
  })
})
