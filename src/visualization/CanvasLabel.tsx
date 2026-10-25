import { Billboard } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

/**
 * A label drawn using browser canvas fonts; no remote font downloads.
 * Drei's 3D <Text> normally requests a hosted font at runtime, so M6
 * replaces it with this self-contained canvas texture for offline use.
 */
export function CanvasLabel({text,color='#ffffff',outlineColor,glow=false,width=0.55,height=0.32,billboard=false}:{
  text:string; color?:string; outlineColor?:string; glow?:boolean;
  width?:number; height?:number; billboard?:boolean
}) {
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas')
    canvas.width=512
    canvas.height=256
    const ctx=canvas.getContext('2d')
    if(!ctx) throw new Error('Canvas 2D context unavailable')
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.font='bold 165px Arial, Helvetica, sans-serif'
    ctx.textAlign='center'
    ctx.textBaseline='middle'
    ctx.lineJoin='round'
    if(glow){
      ctx.shadowColor=outlineColor||color
      ctx.shadowBlur=27
      ctx.lineWidth=14
      ctx.strokeStyle=outlineColor||color
      ctx.strokeText(text,256,135)
      ctx.shadowBlur=0
    }else if(outlineColor){
      ctx.strokeStyle=outlineColor
      ctx.lineWidth=5
      ctx.strokeText(text,256,135)
    }
    ctx.fillStyle=color
    ctx.fillText(text,256,135)
    const result=new THREE.CanvasTexture(canvas)
    result.colorSpace=THREE.SRGBColorSpace
    return result
  },[text,color,outlineColor,glow])
  useEffect(()=>()=>texture.dispose(),[texture])
  const mesh=<mesh>
    <planeGeometry args={[width,height]}/>
    <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} side={THREE.DoubleSide}/>
  </mesh>
  return billboard?<Billboard>{mesh}</Billboard>:mesh
}
