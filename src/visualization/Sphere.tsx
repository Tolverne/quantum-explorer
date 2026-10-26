import { Canvas, ThreeEvent } from '@react-three/fiber'
import { Billboard, OrbitControls } from '@react-three/drei'
import { CanvasLabel } from './CanvasLabel'
import { useMemo, useState } from 'react'
import * as THREE from 'three'
import type { Axis, Vector } from '../quantum/bloch'

type CaptureTarget = EventTarget & {
  setPointerCapture?: (pointerId: number) => void
  hasPointerCapture?: (pointerId: number) => boolean
  releasePointerCapture?: (pointerId: number) => void
}

function Guide({ plane }: { plane: 'xy' | 'xz' | 'yz' }) {
  const line = useMemo(() => {
    const points = Array.from({ length: 129 }, (_, i) => {
      const a = 2 * Math.PI * i / 128
      const x = Math.cos(a), y = Math.sin(a)
      return plane === 'xy' ? new THREE.Vector3(x,y,0) :
        plane === 'xz' ? new THREE.Vector3(x,0,y) : new THREE.Vector3(0,x,y)
    })
    return new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: '#8faac8', transparent: true, opacity: 0.55 })
    )
  }, [plane])
  return <primitive object={line}/>
}

function Axis({ direction, color, axis, active, disabled, onStartHold, onEndHold }: {
  direction: readonly [number,number,number]
  color: string
  axis: Axis
  active: boolean
  disabled: boolean
  onStartHold: (axis: Axis) => void
  onEndHold: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const line = useMemo(() => new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...direction).multiplyScalar(-1.4),
      new THREE.Vector3(...direction).multiplyScalar(1.4)
    ]),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 })
  ), [direction[0],direction[1],direction[2],color])
  const position = useMemo(
    () => new THREE.Vector3(...direction).multiplyScalar(1.7),
    [direction[0],direction[1],direction[2]]
  )
  function down(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation()
    if (disabled || event.button !== 0) return
    const target = event.target as CaptureTarget | null
    target?.setPointerCapture?.(event.pointerId)
    onStartHold(axis)
  }
  function up(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation()
    if (active) onEndHold()
    const target = event.target as CaptureTarget | null
    if (target?.hasPointerCapture?.(event.pointerId)) {
      target.releasePointerCapture?.(event.pointerId)
    }
  }
  return <>
    <primitive object={line}/>
    <Billboard position={position}>
      <group
        onPointerOver={event => { event.stopPropagation(); setHovered(true); document.body.style.cursor = disabled ? 'default' : 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
        onPointerDown={down}
        onPointerUp={up}
        onPointerCancel={up}
      >
        {/* Invisible hit area behind the original coloured label. No visible button. */}
        <mesh>
          <planeGeometry args={[0.64,0.64]}/>
          <meshBasicMaterial transparent opacity={0} depthWrite={false}/>
        </mesh>
        <group position={[0,0,0.013]}>
          <CanvasLabel
            text={axis.toUpperCase()}
            color={disabled && !active ? '#60748d' : active ? '#fff4aa' : hovered ? '#ffffff' : color}
            outlineColor={active ? '#ff9c38' : color}
            glow={active || (hovered && !disabled)}
            width={0.53}
            height={0.36}
          />
        </group>
      </group>
    </Billboard>
  </>
}

function Arrow({ state }: { state: Vector }) {
  const rotation = useMemo(() => new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0,0,1),
    new THREE.Vector3(...state).normalize()
  ), [state[0],state[1],state[2]])

  // The cone tip reaches radius 1 (the sphere surface); shaft and head join at 0.84.
  const length=Math.min(1,Math.max(0,Math.hypot(...state)))
  return <group quaternion={rotation} scale={[1,1,length]}>
    <mesh position={[0,0,0.42]} rotation={[Math.PI/2,0,0]}>
      <cylinderGeometry args={[0.045,0.045,0.84,14]}/>
      <meshBasicMaterial color="#ffd48b"/>
    </mesh>
    <mesh position={[0,0,0.92]} rotation={[Math.PI/2,0,0]}>
      <coneGeometry args={[0.135,0.16,16]}/>
      <meshBasicMaterial color="#ffd48b"/>
    </mesh>
  </group>
}


function TargetArrow({ target }: { target: Vector }) {
  const rotation = useMemo(() => new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0,0,1),
    new THREE.Vector3(...target).normalize()
  ), [target[0], target[1], target[2]])
  return <group quaternion={rotation}>
    <mesh position={[0,0,0.42]} rotation={[Math.PI/2,0,0]}>
      <cylinderGeometry args={[0.055,0.055,0.84,14]}/>
      <meshBasicMaterial color="#65ecd7" transparent opacity={0.4} depthWrite={false}/>
    </mesh>
    <mesh position={[0,0,0.92]} rotation={[Math.PI/2,0,0]}>
      <coneGeometry args={[0.16,0.16,16]}/>
      <meshBasicMaterial color="#65ecd7" transparent opacity={0.4} depthWrite={false}/>
    </mesh>
    <mesh position={[0,0,1.04]}>
      <torusGeometry args={[0.15,0.017,8,40]}/>
      <meshBasicMaterial color="#65ecd7" transparent opacity={0.85} depthWrite={false}/>
    </mesh>
  </group>
}

export default function Sphere({ state, target, allowedAxes, heldAxis, onStartHold, onEndHold, locked, busy, axesDisabled = false }: {
  state: Vector
  target?: Vector
  allowedAxes: readonly Axis[]
  heldAxis: Axis | null
  onStartHold: (axis: Axis) => void
  onEndHold: () => void
  locked: boolean
  busy: boolean
  axesDisabled?: boolean
}) {
  return <Canvas camera={{position:[2.9,2.4,2.5],fov:40}} dpr={[1,2]}>
    <color attach="background" args={['#101b30']}/>
    <ambientLight intensity={1.5}/>
    <directionalLight position={[3,3,5]} intensity={1.5}/>
    <mesh>
      <sphereGeometry args={[1,48,32]}/>
      <meshStandardMaterial color="#79bbed" transparent opacity={0.23} depthWrite={false}/>
    </mesh>
    <Guide plane="xy"/><Guide plane="xz"/><Guide plane="yz"/>
    <Axis direction={[1,0,0]} color="#ef8a79" axis="x" active={heldAxis==='x'} disabled={busy || axesDisabled || !allowedAxes.includes('x')} onStartHold={onStartHold} onEndHold={onEndHold}/>
    <Axis direction={[0,1,0]} color="#78dbba" axis="y" active={heldAxis==='y'} disabled={busy || axesDisabled || !allowedAxes.includes('y')} onStartHold={onStartHold} onEndHold={onEndHold}/>
    <Axis direction={[0,0,1]} color="#86aafa" axis="z" active={heldAxis==='z'} disabled={busy || axesDisabled || !allowedAxes.includes('z')} onStartHold={onStartHold} onEndHold={onEndHold}/>
    <group position={[0.25,0,1.2]}><CanvasLabel text="|0⟩" width={0.38} height={0.24} billboard/></group>
    <group position={[0.25,0,-1.2]}><CanvasLabel text="|1⟩" width={0.38} height={0.24} billboard/></group>
    {target && <TargetArrow target={target}/>}
    {Math.hypot(...state) < 0.025 ? <mesh>
      <sphereGeometry args={[0.13,24,16]}/>
      <meshBasicMaterial color="#ffd48b"/>
    </mesh> : <Arrow state={state}/>}
    <OrbitControls
      enabled={!locked && !busy}
      enablePan={false}
      rotateSpeed={1.55}
      zoomSpeed={1.5}
      minDistance={1.8}
      maxDistance={8}
    />
  </Canvas>
}
