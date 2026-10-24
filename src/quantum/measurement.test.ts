import { describe, expect, it } from 'vitest'
import { measurementProbabilities, measure, runShots, collapsedState } from './measurement'
import { NORTH, rotate, type Vector } from './bloch'

const close = (actual: readonly number[], expected: readonly number[]) => {
  expected.forEach((v,i) => expect(actual[i]).toBeCloseTo(v,10))
}
describe('projective measurement of a single qubit', () => {
  it('Z basis yields deterministic outcomes at north and south poles', () => {
    close(measurementProbabilities(NORTH,'z'),[1,0])
    close(measurementProbabilities([0,0,-1],'z'),[0,1])
    expect(measure(NORTH,'z',()=>0.99).outcome).toBe(0)
    expect(measure([0,0,-1],'z',()=>0).outcome).toBe(1)
  })
  it('equatorial |+> gives 50/50 in Z but certainty in X', () => {
    const plus: Vector = [1,0,0]
    close(measurementProbabilities(plus,'z'),[0.5,0.5])
    close(measurementProbabilities(plus,'x'),[1,0])
    close(measurementProbabilities([-1,0,0],'x'),[0,1])
  })
  it('arbitrary state follows Born probabilities', () => {
    const state = rotate(NORTH,'y',60)
    close(measurementProbabilities(state,'z'),[0.75,0.25])
  })
  it('single measurements collapse into the observed eigenstate', () => {
    const plus: Vector = [1,0,0]
    const zero = measure(plus,'z',()=>0.2)
    const one = measure(plus,'z',()=>0.8)
    close(zero.after,[0,0,1])
    close(one.after,[0,0,-1])
    expect(zero.probability).toBeCloseTo(0.5)
  })
  it('remeasuring same qubit in same basis repeats the observed result', () => {
    const first = measure([1,0,0],'z',()=>0.8)
    const second = measure(first.after,'z',()=>0.1)
    expect(first.outcome).toBe(1)
    expect(second.outcome).toBe(1)
  })
  it('switching to X basis after Z collapse restores 50/50', () => {
    const collapsed = collapsedState('z',0)
    close(measurementProbabilities(collapsed,'x'),[0.5,0.5])
  })
  it('each shot of a batch measures a fresh prepared state', () => {
    const values = [0.1,0.9,0.6,0.3]
    let index=0
    const batch=runShots([1,0,0],'z',4,()=>values[index++])
    expect(batch.counts).toEqual([2,2])
    expect(batch.total).toBe(4)
    close(batch.expected,[0.5,0.5])
  })
  it('deterministic prepared states remain deterministic for 1000 shots', () => {
    expect(runShots(NORTH,'z',1000,()=>0.99).counts).toEqual([1000,0])
    expect(runShots([-1,0,0],'x',100,()=>0).counts).toEqual([0,100])
  })
  it('keeps simulated batches separate from an already collapsed single qubit', () => {
    const prepared: Vector = [1,0,0]
    const single=measure(prepared,'z',()=>0.8)
    expect(single.after).toEqual([0,0,-1])
    const shots=runShots(prepared,'z',2,(()=>{let n=0;return ()=> n++ === 0 ? 0.1 : 0.9})())
    expect(shots.counts).toEqual([1,1])
  })
  it('rejects invalid shot counts and RNG results', () => {
    expect(()=>runShots(NORTH,'z',0)).toThrow()
    expect(()=>runShots(NORTH,'z',1.5)).toThrow()
    expect(()=>measure(NORTH,'z',()=>1)).toThrow()
  })
})
