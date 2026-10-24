import { describe, expect, it } from 'vitest'
import { holdDegrees, roundDegrees } from './hold'
import { NORTH, apply, rotate } from '../quantum/bloch'

describe('press-and-hold rotation', () => {
  it('adds rotation at 72 degrees per second', () => {
    expect(holdDegrees(1000, 2250, 1)).toBe(90)
  })
  it('supports negative direction and clamps negative elapsed times', () => {
    expect(holdDegrees(1000, 1500, -1)).toBe(-36)
    expect(holdDegrees(1000, 900, 1)).toBe(0)
  })
  it('rounds a saved pulse to one tenth of a degree', () => {
    expect(roundDegrees(23.276)).toBe(23.3)
    expect(roundDegrees(-0.01)).toBe(0)
  })
  it('saves a reversible rotation rather than a frame-by-frame sequence', () => {
    const command = { axis: 'y' as const, angle: roundDegrees(holdDegrees(0, 625, 1)) }
    const prepared = apply([command])
    expect(prepared[0]).toBeCloseTo(Math.SQRT1_2)
    const original = rotate(prepared, command.axis, -command.angle)
    original.forEach((value, index) => expect(value).toBeCloseTo(NORTH[index]))
  })
})
