export type Axis = 'x' | 'y' | 'z'
export type Vector = readonly [number, number, number]
export type Pulse = { axis: Axis; angle: number }
export const NORTH: Vector = [0, 0, 1]
const axes: Record<Axis, Vector> = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }
export function rotate(v: Vector, axis: Axis, degrees: number): Vector {
  const [kx, ky, kz] = axes[axis]
  const [x, y, z] = v
  const a = degrees * Math.PI / 180
  const c = Math.cos(a), s = Math.sin(a), dot = kx*x + ky*y + kz*z
  const result: Vector = [
    x*c + (ky*z-kz*y)*s + kx*dot*(1-c),
    y*c + (kz*x-kx*z)*s + ky*dot*(1-c),
    z*c + (kx*y-ky*x)*s + kz*dot*(1-c)
  ]
  const length = Math.hypot(...result)
  return result.map(n => n / length) as unknown as Vector
}
export function apply(pulses: readonly Pulse[]): Vector {
  return pulses.reduce<Vector>((v, p) => rotate(v, p.axis, p.angle), NORTH)
}
export function stateName([x,y,z]: Vector): string {
  const near = (a:number,b:number) => Math.abs(a-b)<1e-5
  if (near(z,1)) return '|0⟩'
  if (near(z,-1)) return '|1⟩'
  if (near(x,1)) return '|+⟩'
  if (near(x,-1)) return '|−⟩'
  if (near(y,1)) return '|+i⟩'
  if (near(y,-1)) return '|−i⟩'
  return 'Superposition'
}
