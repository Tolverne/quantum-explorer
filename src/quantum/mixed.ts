import type { Vector } from './bloch'
import type { MeasurementBasis } from './measurement'

export type MixtureAxis = 'z' | 'x'
export type MixedShotCounts = {
  counts: readonly [number,number]
  expected: readonly [number,number]
  total: number
  basis: MeasurementBasis
}

/**
 * An ensemble of opposing pure states along X or Z:
 *   ρ = p|axis+><axis+| + (1-p)|axis−><axis−|
 * Its Bloch vector is (2p - 1) times the chosen unit axis.
 * A Bloch vector shorter than 1 represents a mixed state, not
 * an incorrectly normalised pure-state arrow.
 */
export function mixtureVector(axis: MixtureAxis,p: number): Vector {
  if (!Number.isFinite(p) || p < 0 || p > 1) throw new Error('Mixture probability must be between 0 and 1')
  const component=2*p-1
  return axis==='z'?[0,0,component]:[component,0,0]
}

/** Born rule for a mixed state in Bloch form. Do NOT normalise r! */
export function mixedProbabilities(vector: Vector,basis: MeasurementBasis): readonly [number,number] {
  const length=Math.hypot(...vector)
  if (length>1+1e-9) throw new Error('Invalid Bloch vector outside unit ball')
  const component=basis==='z'?vector[2]:vector[0]
  const plus=Math.max(0,Math.min(1,(1+component)/2))
  return [plus,1-plus]
}

export function mixedPurity(vector: Vector): number {
  const length=Math.hypot(...vector)
  if(length>1+1e-9) throw new Error('Invalid Bloch vector outside unit ball')
  return (1+length*length)/2
}

export function runMixedShots(
  vector:Vector,basis:MeasurementBasis,total:number,random:()=>number=Math.random
):MixedShotCounts {
  if (!Number.isSafeInteger(total)||total<1||total>10000) throw new Error('Invalid trial count')
  const expected=mixedProbabilities(vector,basis)
  let positive=0
  for(let i=0;i<total;i++){
    const result=random()
    if(!Number.isFinite(result)||result<0||result>=1) throw new Error('Random draw must be in [0, 1)')
    if(result<expected[0])positive++
  }
  return {counts:[positive,total-positive],expected,total,basis}
}
