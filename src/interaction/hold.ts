// Continuous rotation for as long as an axis label is pressed.
export const HOLD_SPEED_DEGREES_PER_SECOND = 72
export function holdDegrees(startMs: number, nowMs: number, direction: 1 | -1): number {
  return Math.max(0, nowMs - startMs) / 1000 * HOLD_SPEED_DEGREES_PER_SECOND * direction
}
export function roundDegrees(angle: number): number {
  const result = Math.round(angle * 10) / 10
  return Object.is(result, -0) ? 0 : result
}
