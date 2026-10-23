import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import type { Vector } from '../quantum/bloch'
function Guide({ plane }: { plane: 'xy' | 'xz' | 'yz' }) {
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(
    Array.from({ length: 129 }, (_, i) => {
      const a = 2*Math.PI*i/128
      const x = Math.cos(a), y = Math.sin(a)
      return plane === 'xy' ? new THREE.Vector3(x,y,0) :
        plane === 'xz' ? new THREE.Vector3(x,0,y) : new THREE.Vector3(0,x,y)
    })
  ), [plane])
  return <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({color:"#8faac8",transparent:true,opacity:0.55}))}/>
}
function Axis({ direction, color, name }: {direction:[number,number,number];color:string;name:string}) {
  const geom = useMemo(() => new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(...direction).multiplyScalar(-1.42),
    new THREE.Vector3(...direction).multiplyScalar(1.42)
  ]), [direction[0],direction[1],direction[2]])
  return <>
    <primitive object={new THREE.Line(geom, new THREE.LineBasicMaterial({color,transparent:true,opacity:0.8}))}/>
    <Text position={new THREE.Vector3(...direction).multiplyScalar(1.65)} fontSize={0.19} color={color}>{name}</Text>
  </>
}
function Arrow({ state }: {state:Vector}) {
  const arrow = useMemo(() => new THREE.ArrowHelper(new THREE.Vector3(0,0,1),new THREE.Vector3(),1.16,0xffd48b,0.22,0.12),[])
  arrow.setDirection(new THREE.Vector3(...state).normalize())
  return <primitive object={arrow}/>
}
export default function Sphere({state}: {state:Vector}) {
  return <Canvas camera={{position:[2.9,2.4,2.5],fov:40}} dpr={[1,2]}>
    <color attach="background" args={['#101b30']}/>
    <ambientLight intensity={1.5}/>
    <directionalLight position={[3,3,5]} intensity={1.5}/>
    <mesh><sphereGeometry args={[1,48,32]}/><meshStandardMaterial color="#4e8dc5" transparent opacity={0.11} depthWrite={false}/></mesh>
    <Guide plane="xy"/><Guide plane="xz"/><Guide plane="yz"/>
    <Axis direction={[1,0,0]} color="#ef8a79" name="X"/>
    <Axis direction={[0,1,0]} color="#78dbba" name="Y"/>
    <Axis direction={[0,0,1]} color="#86aafa" name="Z"/>
    <Text position={[0.22,0,1.21]} fontSize={0.18} color="white">|0⟩</Text>
    <Text position={[0.22,0,-1.21]} fontSize={0.18} color="white">|1⟩</Text>
    <Arrow state={state}/>
    <OrbitControls enablePan={false} minDistance={2} maxDistance={8}/>
  </Canvas>
}
