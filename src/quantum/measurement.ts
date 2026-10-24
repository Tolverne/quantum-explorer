import type { Vector } from './bloch'

export type MeasurementBasis = 'z' | 'x'
export type Outcome = 0 | 1

export const BASIS_LABELS: Record<MeasurementBasis, readonly [string, string]> = {
  z: ['0', '1'],
  x: ['+', '−']
}
export const BASIS_DIRECTIONS: Record<MeasurementBasis, Vector> = {
  z: [0, 0, 1],
  x: [1, 0, 0]
}

/**
 * Ideal projective measurement of a pure single-qubit Bloch vector.
 * Outcome 0 denotes the + direction of the chosen axis; 1 denotes −.
 * For X-basis outcomes, use the labels '+' and '−' in the interface.
 */
export function measurementProbabilities(state: Vector, basis: MeasurementBasis): readonly [number, number] {
  const axis = BASIS_DIRECTIONS[basis]
  const length = Math.hypot(...state)
  if (length < 1e-12) throw new Error('A pure qubit needs a nonzero Bloch vector')
  const dot = (state[0]*axis[0] + state[1]*axis[1] + state[2]*axis[2]) / length
  const p0 = Math.max(0, Math.min(1, (1 + dot)/2))
  return [p0, 1 - p0]
}

export function collapsedState(basis: MeasurementBasis, outcome: Outcome): Vector {
  const axis = BASIS_DIRECTIONS[basis]
  return outcome === 0 ? axis : [(-axis[0]) || 0, (-axis[1]) || 0, (-axis[2]) || 0]
}

export type MeasurementResult = {
  basis: MeasurementBasis
  outcome: Outcome
  before: Vector
  after: Vector
  probability: number
}

export function measure(
  state: Vector,
  basis: MeasurementBasis,
  random: () => number = Math.random
): MeasurementResult {
  const [p0, p1] = measurementProbabilities(state, basis)
  const draw = random()
  if (!Number.isFinite(draw) || draw < 0 || draw >= 1) throw new Error('Random draw must be in [0, 1)')
  const outcome: Outcome = draw < p0 ? 0 : 1
  return { basis, outcome, before: state, after: collapsedState(basis, outcome), probability: outcome === 0 ? p0 : p1 }
}

export type ShotCounts = {
  basis: MeasurementBasis
  total: number
  counts: readonly [number, number]
  expected: readonly [number, number]
}
/** Fresh preparation for every shot. Never measures an already collapsed qubit repeatedly. */
export function runShots(
  preparedState: Vector, basis: MeasurementBasis, total: number, random: () => number = Math.random
): ShotCounts {
  if (!Number.isSafeInteger(total) || total < 1 || total > 10000) throw new Error('Invalid shot count')
  const expected = measurementProbabilities(preparedState, basis)
  let count0 = 0
  for (let i = 0; i < total; i++) if (measure(preparedState,basis,random).outcome === 0) count0++
  return { basis, total, counts: [count0, total - count0], expected }
}
