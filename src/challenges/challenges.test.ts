import { describe, expect, it } from 'vitest'
import { CHALLENGES, ANGULAR_TOLERANCE_DEGREES, angularDistance, checkChallenge, applyFrom } from './challenges'
import { NORTH, type Pulse } from '../quantum/bloch'

const examples: Pulse[][] = [
  [{ axis:'x', angle:180 }],
  [{ axis:'y', angle:90 }],
  [{ axis:'x', angle:90 }],
  [{ axis:'z', angle:90 }],
  [{ axis:'y', angle:90 }, { axis:'z', angle:90 }],
  [{ axis:'z', angle:90 }, { axis:'x', angle:90 }],
  [{ axis:'y', angle:90 }],
  [{ axis:'z', angle:180 }],
  [{ axis:'x', angle:-90 }],
  [{ axis:'x', angle:90 }, { axis:'z', angle:-90 }]
]

describe('M2 target-state challenges', () => {
  it('each provided challenge has a valid allowed-gate solution', () => {
    expect(CHALLENGES).toHaveLength(examples.length)
    CHALLENGES.forEach((challenge, i) => {
      const pulses = examples[i]
      expect(pulses.every(p => challenge.allowedAxes.includes(p.axis))).toBe(true)
      const assessment = checkChallenge(challenge,applyFrom(challenge.start,pulses),pulses)
      expect(assessment.success,challenge.id).toBe(true)
      expect(assessment.efficient,challenge.id).toBe(true)
      expect(assessment.angle).toBeCloseTo(0,6)
    })
  })
  it('distance is independent of the camera view', () => {
    expect(angularDistance(NORTH,[0,0,-1])).toBeCloseTo(180)
    expect(angularDistance(NORTH,[1,0,0])).toBeCloseTo(90)
    expect(angularDistance(NORTH,NORTH)).toBeCloseTo(0)
  })
  it('clamps round-off errors in inverse cosine', () => {
    expect(angularDistance([1,0,0],[1+1e-12,0,0])).toBeCloseTo(0,5)
  })
  it('requires the student to apply a pulse, not just start at the target', () => {
    const challenge = CHALLENGES[0]
    expect(checkChallenge(challenge,challenge.target,[]).success).toBe(false)
  })
  it('tolerates a near miss but rejects a clear miss', () => {
    const challenge = CHALLENGES[1]
    expect(checkChallenge(challenge,applyFrom(NORTH,[{axis:'y',angle:90 - ANGULAR_TOLERANCE_DEGREES / 2}]),[{axis:'y',angle:85}]).success).toBe(true)
    expect(checkChallenge(challenge,applyFrom(NORTH,[{axis:'y',angle:70}]),[{axis:'y',angle:70}]).success).toBe(false)
  })
  it('honours alternate starting states on undo/replay calculations', () => {
    const challenge = CHALLENGES[3]
    expect(angularDistance(applyFrom(challenge.start,[]),challenge.start)).toBeCloseTo(0)
  })
})
