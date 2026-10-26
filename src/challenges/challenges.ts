import { type Axis, type Pulse, type Vector, NORTH, rotate } from '../quantum/bloch'

export const SOUTH: Vector = [0, 0, -1]
export const PLUS_X: Vector = [1, 0, 0]
export const PLUS_Y: Vector = [0, 1, 0]
export const MINUS_Y: Vector = [0, -1, 0]

export type Challenge = {
  id: string
  title: string
  prompt: string
  start: Vector
  startLabel: string
  target: Vector
  targetLabel: string
  allowedAxes: readonly Axis[]
  examplePulses: number
  hint: string
  teacherNote: string
}

export const CHALLENGES: readonly Challenge[] = [
  {
    id: 'bit-flip', title: 'Flip a bit',
    prompt: 'Start at the north pole. Rotate the qubit all the way to the south pole.',
    start: NORTH, startLabel: '|0⟩', target: SOUTH, targetLabel: '|1⟩',
    allowedAxes: ['x'], examplePulses: 1,
    hint: 'Try one half-turn (180°) about the X axis.',
    teacherNote: 'A Pauli X gate rotates a Bloch vector 180° about X.'
  },
  {
    id: 'equator-plus-x', title: 'Discover the equator',
    prompt: 'Move from the north pole to the +X direction. How far do you rotate?',
    start: NORTH, startLabel: '|0⟩', target: PLUS_X, targetLabel: '|+⟩',
    allowedAxes: ['y'], examplePulses: 1,
    hint: 'A quarter-turn (+90°) about Y takes the north pole to +X.',
    teacherNote: 'A Y quarter-turn creates an equatorial superposition.'
  },
  {
    id: 'equator-minus-y', title: 'Another superposition',
    prompt: 'Find a different point on the equator: the −Y direction.',
    start: NORTH, startLabel: '|0⟩', target: MINUS_Y, targetLabel: '|−i⟩',
    allowedAxes: ['x'], examplePulses: 1,
    hint: 'Try a +90° rotation about X. Positive angles follow the right-hand rule.',
    teacherNote: 'X(+90°) on |0⟩ points to −Y, not +Y.'
  },
  {
    id: 'around-equator', title: 'Change the phase',
    prompt: 'You start at +X. Travel along the equator until the arrow points to +Y.',
    start: PLUS_X, startLabel: '|+⟩', target: PLUS_Y, targetLabel: '|+i⟩',
    allowedAxes: ['z'], examplePulses: 1,
    hint: 'A +90° turn about Z takes +X to +Y.',
    teacherNote: 'Z rotations change the relative phase of an equatorial state.'
  },
  {
    id: 'two-pulse-route', title: 'Two-pulse route',
    prompt: 'Reach +Y from the north pole using only Y and Z rotations.',
    start: NORTH, startLabel: '|0⟩', target: PLUS_Y, targetLabel: '|+i⟩',
    allowedAxes: ['y', 'z'], examplePulses: 2,
    hint: 'First use Y to reach +X. Then use Z to travel around the equator.',
    teacherNote: 'Under the allowed axes, two nontrivial rotations are necessary.'
  },
  {
    id: 'return-home', title: 'Find your way home',
    prompt: 'Starting on +X, return to the north pole. X and Z rotations only!',
    start: PLUS_X, startLabel: '|+⟩', target: NORTH, targetLabel: '|0⟩',
    allowedAxes: ['x', 'z'], examplePulses: 2,
    hint: 'A +90° Z rotation reaches +Y. Then X(+90°) moves +Y to +Z.',
    teacherNote: 'Rotations do not commute; their order matters.'
  },
  {
    id:'reverse-quarter', title:'From one to the equator',
    prompt:'Begin at |1⟩ and find the −X direction using only Y rotations.',
    start:SOUTH, startLabel:'|1⟩', target:[-1,0,0], targetLabel:'|−⟩',
    allowedAxes:['y'], examplePulses:1,
    hint:'A positive 90° Y turn moves −Z to −X.',
    teacherNote:'The same quarter turn acts differently depending on the initial state.'
  },
  {
    id:'equator-opposite', title:'Across the equator',
    prompt:'Starting at +X, reach −X without leaving the equatorial plane.',
    start:PLUS_X, startLabel:'|+⟩', target:[-1,0,0], targetLabel:'|−⟩',
    allowedAxes:['z'], examplePulses:1,
    hint:'Turn by a half-circle about Z.',
    teacherNote:'A 180° Z rotation maps |+⟩ to |−⟩ (up to global phase).'
  },
  {
    id:'quarter-other-way', title:'Choose the other direction',
    prompt:'Go directly from |0⟩ to +Y with a single X rotation.',
    start:NORTH, startLabel:'|0⟩', target:PLUS_Y, targetLabel:'|+i⟩',
    allowedAxes:['x'], examplePulses:1,
    hint:'Try a negative quarter-turn around X.',
    teacherNote:'X(−90°) maps +Z to +Y, illustrating the right-hand rule.'
  },
  {
    id:'restricted-route', title:'Find the restricted route',
    prompt:'From |0⟩, reach −X, but you may only use X and Z rotations.',
    start:NORTH, startLabel:'|0⟩', target:[-1,0,0], targetLabel:'|−⟩',
    allowedAxes:['x','z'], examplePulses:2,
    hint:'X(+90°) takes you to −Y; then Z(−90°) takes −Y to −X.',
    teacherNote:'Two noncommuting pulses prepare an otherwise inaccessible target.'
  }
]

export const ANGULAR_TOLERANCE_DEGREES = 10

export function angularDistance(a: Vector, b: Vector): number {
  const dot = a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
  const productOfLengths = Math.hypot(...a) * Math.hypot(...b)
  return Math.acos(Math.max(-1, Math.min(1, dot / productOfLengths))) * 180 / Math.PI
}

export function checkChallenge(
  challenge: Challenge,
  state: Vector,
  pulses: readonly Pulse[]
) {
  const angle = angularDistance(state, challenge.target)
  return {
    angle,
    success: pulses.length > 0 && angle <= ANGULAR_TOLERANCE_DEGREES,
    pulseCount: pulses.length,
    efficient: pulses.length > 0 && pulses.length <= challenge.examplePulses
  }
}

export function applyFrom(start: Vector, pulses: readonly Pulse[]): Vector {
  return pulses.reduce<Vector>((v, p) => rotate(v, p.axis, p.angle), start)
}
