import { Canvas, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import type { Axis, Vector } from '../quantum/bloch'

function Guide({ plane }: { plane: 'xy' | 'xz' | 'yz' }) {
  const points = useMemo(() => Array.from({ length: 129 }, (_, i) => {
    const a = 2 * Math.PI * i / 128, x = Math.cos(a), y = Math.sin(a)
    return plane === 'xy' ? new THREE.Vector3(x,y,0) :
      plane === 'xz' ? new THREE.Vector3(x,0,y) : new THREE.Vector3(0,x,y)
  }), [plane])
  const line = useMemo(() => new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: '#8faac8', transparent: true, opacity: 0.55 })
  ), [points])
  return <primitive object={line}/>
}
function Axis({ direction, color, name, axis, selected, disabled, onSelect }: {
  direction: [number,number,number]; color:string; name:string; axis:Axis
  selected:boolean; disabled:boolean; onSelect:(axis:Axis)=>void
}) {
  const line = useMemo(() => new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...direction).multiplyScalar(-1.42),
      new THREE.Vector3(...direction).multiplyScalar(1.42)
    ]),
    new THREE.LineBasicMaterial({ color, transparent:true, opacity: 0.8 })
  ), [direction[0],direction[1],direction[2],color])
  const location = useMemo(() => new THREE.Vector3(...direction).multiplyScalar(1.65), [direction[0],direction[1],direction[2]])
  function choose(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    if (!disabled) onSelect(axis)
  }
  return <>
    <primitive object={line}/>
    <group position={location} onClick={choose} onPointerOver={e=>{e.stopPropagation();document.body.style.cursor=disabled?'default':'pointer'}} onPointerOut={()=>{document.body.style.cursor='auto'}}>
      <mesh><sphereGeometry args={[selected ? 0.26 : 0.23,16,12]}/><meshBasicMaterial color={selected?'#f8da94':'#223b57'} transparent opacity={0.95}/></mesh>
      <Text fontSize={0.2} color={selected?'#182737':color} anchorX="center" anchorY="middle">{name}</Text>
    </group>
  </>
}
function Arrow({ state }: { state:Vector }) {
  // Declarative rotation ensures React Three Fiber applies every intermediate
  // quaternion, rather than relying on mutation of an unchanged primitive.
  const dir = useMemo(() => new THREE.Vector3(...state).normalize(), [state[0],state[1],state[2]])
  const quaternion = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),dir), [dir])
  return <group quaternion={quaternion}>
    <mesh position={[0,0,0.47]}><cylinderGeometry args={[0.045,0.045,0.94,12]}/><meshBasicMaterial color="#ffd48b"/></mesh>
    <mesh position={[0,0,1.06]} rotation={[Math.PI/2,0,0]}><coneGeometry args={[0.13,0.23,16]}/><meshBasicMaterial color="#ffd48b"/></mesh>
  </group>
}
export default function Sphere({state,axis,onSelectAxis,locked,busy}:{
  state:Vector;axis:Axis;onSelectAxis:(axis:Axis)=>void;locked:boolean;busy:boolean
}) {
  return <Canvas camera={{position:[2.9,2.4,2.5],fov:40}} dpr={[1,2]}>
    <color attach="background" args={['#101b30']}/>
    <ambientLight intensity={1.5}/>
    <directionalLight position={[3,3,5]} intensity={1.5}/>
    <mesh><sphereGeometry args={[1,48,32]}/><meshStandardMaterial color="#4e8dc5" transparent opacity={0.11} depthWrite={false}/></mesh>
    <Guide plane="xy"/><Guide plane="xz"/><Guide plane="yz"/>
    <Axis direction={[1,0,0]} axis="x" color="#ef8a79" name="X" selected={axis==='x'} disabled={busy} onSelect={onSelectAxis}/>
    <Axis direction={[0,1,0]} axis="y" color="#78dbba" name="Y" selected={axis==='y'} disabled={busy} onSelect={onSelectAxis}/>
    <Axis direction={[0,0,1]} axis="z" color="#86aafa" name="Z" selected={axis==='z'} disabled={busy} onSelect={onSelectAxis}/>
    <Text position={[0.22,0,1.21]} fontSize={0.18} color="white">|0⟩</Text>
    <Text position={[0.22,0,-1.21]} fontSize={0.18} color="white">|1⟩</Text>
    <Arrow state={state}/>
    <OrbitControls enabled={!locked} enablePan={false} minDistance={2} maxDistance={8}/>
  </Canvas>
}
