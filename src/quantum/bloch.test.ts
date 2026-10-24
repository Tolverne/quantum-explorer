import { describe, expect, it } from 'vitest'
import { rotate, NORTH, apply, stateName, type Vector } from './bloch'
function same(a: Vector, b: Vector) { a.forEach((x,i) => expect(x).toBeCloseTo(b[i], 10)) }
describe('Bloch sphere rotation conventions', () => {
  it('X 180 moves |0> to |1>', () => same(rotate(NORTH,'x',180),[0,0,-1]))
  it('Y 90 maps north to +X', () => same(rotate(NORTH,'y',90),[1,0,0]))
  it('X 90 maps north to -Y', () => same(rotate(NORTH,'x',90),[0,-1,0]))
  it('Z preserves north', () => same(rotate(NORTH,'z',90), NORTH))
  it('Z rotates +X to +Y', () => same(rotate([1,0,0],'z',90),[0,1,0]))
  it('inverting a rotation restores the state', () => {
    const v: Vector = [Math.SQRT1_2,0,Math.SQRT1_2]
    same(rotate(rotate(v,'y',90),'y',-90),v)
  })
  it('a composed sequence is normalised', () => expect(Math.hypot(...apply([
    {axis:'x',angle:90},{axis:'y',angle:180},{axis:'z',angle:-90}
  ]))).toBeCloseTo(1, 10))
  it('names cardinal states', () => expect(stateName(rotate(NORTH,'y',90))).toBe('|+⟩'))
})

describe('arbitrary-angle controls', () => {
  it('rotates 45 degrees around Y', () => same(rotate(NORTH,'y',45), [Math.SQRT1_2,0,Math.SQRT1_2]))
  it('does not move an axis-aligned vector around its own axis', () => same(rotate([1,0,0],'x',137),[1,0,0]))
  it('preserves length over 180 arbitrary pulses', () => {
    let value:Vector=NORTH
    for(let i=0;i<180;i++) value=rotate(value,(['x','y','z'] as const)[i%3],17)
    expect(Math.hypot(...value)).toBeCloseTo(1,10)
  })
})
