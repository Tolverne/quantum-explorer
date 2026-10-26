import type { MeasurementBasis, Outcome } from './measurement'
import type { Vector } from './bloch'

// M4 uses the real-valued X/Z subspace of two-qubit quantum mechanics.
// All four preparations and both measurement bases have real amplitudes.
// A complex density matrix will be needed for Y-basis / arbitrary phase gates.
export type Density = readonly (readonly number[])[]
export type PairPreparation = 'independent' | 'random-independent' | 'classical' | 'bell-plus' | 'bell-minus'
export type JointOutcome = readonly [Outcome, Outcome]

const ROOT = 1 / Math.sqrt(2)
const ID: number[][] = [[1,0],[0,1]]
const H: number[][] = [[ROOT,ROOT],[ROOT,-ROOT]]
const Z: number[][] = [[1,0],[0,-1]]
const CNOT: number[][] = [
  [1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]
]
const PROJECTORS: Record<MeasurementBasis, readonly number[][][]> = {
  z: [
    [[1,0],[0,0]],
    [[0,0],[0,1]]
  ],
  x: [
    [[0.5,0.5],[0.5,0.5]],
    [[0.5,-0.5],[-0.5,0.5]]
  ]
}
const basisLabels: Record<MeasurementBasis, readonly [string,string]> = {
  z: ['0','1'], x: ['+','−']
}
export const OUTCOMES: readonly JointOutcome[] = [[0,0],[0,1],[1,0],[1,1]]
export function outcomeLabel(outcome: JointOutcome, aliceBasis: MeasurementBasis, bobBasis: MeasurementBasis): string {
  return basisLabels[aliceBasis][outcome[0]] + basisLabels[bobBasis][outcome[1]]
}
export function kron(a: Density, b: Density): number[][] {
  return a.flatMap(rowA=>b.map(rowB=>rowA.flatMap(value=>rowB.map(v=>value*v))))
}
function transpose(a: Density): number[][] { return a[0].map((_,j)=>a.map(row=>row[j])) }
function multiply(a: Density,b: Density): number[][] {
  const bt=transpose(b)
  return a.map(row=>bt.map(col=>row.reduce((sum,value,k)=>sum+value*col[k],0)))
}
export function trace(a:Density): number { return a.reduce((sum,row,i)=>sum+row[i],0) }
function scale(a:Density,factor:number): number[][] {return a.map(row=>row.map(x=>x*factor))}
function pure(amplitudes: readonly number[]): number[][] {
  return amplitudes.map(a=>amplitudes.map(b=>a*b))
}
function transform(density:Density,gate:Density):number[][]{
  return multiply(multiply(gate,density),transpose(gate))
}
function add(a:Density,b:Density):number[][]{
  return a.map((row,i)=>row.map((v,j)=>v+b[i][j]))
}
const ID4: number[][] = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]
const ZERO_ZERO = pure([1,0,0,0])
const ONE_ONE = pure([0,0,0,1])
export function preparePair(preparation:PairPreparation): number[][] {
  if(preparation==='independent') return transform(ZERO_ZERO,kron(H,H)) // |++>
  if(preparation==='random-independent') return scale(ID4, 0.25) // I/4: two independent fair classical bits
  if(preparation==='classical') return scale(add(ZERO_ZERO,ONE_ONE),0.5)
  // |00> --H on Alice--> (|00>+|10>)/sqrt2 --CNOT--> Phi+
  const bell=transform(transform(ZERO_ZERO,kron(H,ID)),CNOT)
  return preparation==='bell-plus' ? bell : transform(bell,kron(Z,ID))
}
function projected(density:Density,projector:Density) {
  const raw=multiply(multiply(projector,density),projector)
  const probability=Math.max(0,Math.min(1,trace(raw)))
  return {probability,post:probability>1e-12?scale(raw,1/probability):null}
}
export function projectAlice(density:Density,basis:MeasurementBasis,outcome:Outcome){
  return projected(density,kron(PROJECTORS[basis][outcome],ID))
}
export function projectBob(density:Density,basis:MeasurementBasis,outcome:Outcome){
  return projected(density,kron(ID,PROJECTORS[basis][outcome]))
}
export function jointProbabilities(
  density:Density,aliceBasis:MeasurementBasis,bobBasis:MeasurementBasis
): readonly [number,number,number,number] {
  const probabilities=OUTCOMES.map(([a,b])=>projected(
    density,kron(PROJECTORS[aliceBasis][a],PROJECTORS[bobBasis][b])
  ).probability)
  // Correct only floating-point rounding, never alter the quantum predictions.
  const normalisation=probabilities.reduce((sum,p)=>sum+p,0)
  return probabilities.map(p=>p/normalisation) as unknown as readonly [number,number,number,number]
}
export function marginalBloch(density:Density,qubit:'alice'|'bob'): Vector {
  const a=qubit==='alice'
  const r00=a?density[0][0]+density[1][1]:density[0][0]+density[2][2]
  const r11=a?density[2][2]+density[3][3]:density[1][1]+density[3][3]
  const r01=a?density[0][2]+density[1][3]:density[0][1]+density[2][3]
  const norm=trace(density)
  return [2*r01/norm,0,(r00-r11)/norm]
}
export function purity(density:Density):number { return trace(multiply(density,density)) }
function drawOutcome(probs:readonly number[],rng:()=>number):number {
  const r=rng()
  if(!Number.isFinite(r)||r<0||r>=1) throw new Error('RNG must give a number in [0,1)')
  let cumulative=0
  for(let i=0;i<probs.length-1;i++) {
    cumulative+=probs[i]
    if(r<cumulative) return i
  }
  return probs.length-1
}
export function measureAlice(
  density:Density,basis:MeasurementBasis,rng:()=>number=Math.random
) {
  const plus=projectAlice(density,basis,0)
  const outcome=drawOutcome([plus.probability,1-plus.probability],rng) as Outcome
  const projectedPair=projectAlice(density,basis,outcome)
  if(!projectedPair.post) throw new Error('Selected an impossible Alice outcome')
  return {outcome,probability:projectedPair.probability,post:projectedPair.post}
}
export function measureBob(
  density:Density,basis:MeasurementBasis,rng:()=>number=Math.random
) {
  const plus=projectBob(density,basis,0)
  const outcome=drawOutcome([plus.probability,1-plus.probability],rng) as Outcome
  const projectedPair=projectBob(density,basis,outcome)
  if(!projectedPair.post) throw new Error('Selected an impossible Bob outcome')
  return {outcome,probability:projectedPair.probability,post:projectedPair.post}
}
export function samplePair(
  density:Density,aliceBasis:MeasurementBasis,bobBasis:MeasurementBasis,rng:()=>number=Math.random
):JointOutcome {
  // Fresh copy each call; Alice measurement changes Bob's conditional state.
  const alice=measureAlice(density,aliceBasis,rng)
  const bob=measureBob(alice.post,bobBasis,rng)
  return [alice.outcome,bob.outcome]
}
export type PairBatch = {
  count: number
  outcomes: readonly [number,number,number,number]
  probabilities: readonly [number,number,number,number]
  aliceBasis: MeasurementBasis
  bobBasis: MeasurementBasis
}
export function runPairShots(
  density:Density,aliceBasis:MeasurementBasis,bobBasis:MeasurementBasis,count:number,rng:()=>number=Math.random
):PairBatch {
  if(!Number.isSafeInteger(count)||count<1||count>10000) throw new Error('Invalid shot count')
  const counts=[0,0,0,0]
  for(let i=0;i<count;i++) {
    const [a,b]=samplePair(density,aliceBasis,bobBasis,rng)
    counts[a*2+b]++
  }
  return {count,outcomes:counts as unknown as PairBatch['outcomes'],
    probabilities:jointProbabilities(density,aliceBasis,bobBasis),aliceBasis,bobBasis}
}
export function correlation(probabilities:readonly number[]):number {
  return probabilities[0]+probabilities[3]-probabilities[1]-probabilities[2]
}
