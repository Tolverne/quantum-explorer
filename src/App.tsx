import { useEffect, useRef, useState } from 'react'
import Sphere from './visualization/Sphere'
import { NORTH, apply, rotate, stateName, type Axis, type Pulse, type Vector } from './quantum/bloch'

const DURATION = 630
export default function App() {
  const [vector, setVector] = useState<Vector>(NORTH)
  const [history, setHistory] = useState<Pulse[]>([])
  const [axis, setAxis] = useState<Axis>('x')
  const [busy, setBusy] = useState(false)
  const [cameraLocked, setCameraLocked] = useState(true)
  const [customAngle, setCustomAngle] = useState(45)
  const vectorRef = useRef<Vector>(NORTH)
  const busyRef = useRef(false)
  const animation = useRef<number | null>(null)
  const animate = (pulse: Pulse): Promise<void> => new Promise(resolve => {
    const from = vectorRef.current
    const started = performance.now()
    const step = (time:number) => {
      const progress = Math.min(1,(time-started)/DURATION)
      const eased = progress*progress*(3-2*progress)
      const next = rotate(from,pulse.axis,pulse.angle*eased)
      setVector(next)
      if (progress < 1) animation.current = requestAnimationFrame(step)
      else { vectorRef.current = rotate(from,pulse.axis,pulse.angle); setVector(vectorRef.current); animation.current = null; resolve() }
    }
    animation.current = requestAnimationFrame(step)
  })
  useEffect(() => () => { if (animation.current !== null) cancelAnimationFrame(animation.current) }, [])
  const lock = (value:boolean) => { busyRef.current=value; setBusy(value) }
  async function pulse(angle:number) {
    if (busyRef.current) return
    lock(true)
    const command = {axis,angle}
    await animate(command)
    setHistory(h => [...h,command])
    lock(false)
  }
  function reset() {
    if (busyRef.current) return
    vectorRef.current = NORTH; setVector(NORTH); setHistory([])
  }
  function undo() {
    if (busyRef.current || !history.length) return
    const previous = history.slice(0,-1)
    setHistory(previous)
    const value = apply(previous)
    vectorRef.current=value;setVector(value)
  }
  async function replay() {
    if (busyRef.current || !history.length) return
    lock(true)
    const sequence=[...history]
    vectorRef.current=NORTH;setVector(NORTH)
    for (const command of sequence) await animate(command)
    lock(false)
  }
  return <div className="page">
    <header className="header"><span className="logo">Q</span><div><strong>Quantum Explorer</strong><span className="subtitle">Visual quantum physics · no sign-in required</span></div><span className="chip">M1 · Bloch Sphere</span></header>
    <main>
      <section className="intro"><span className="overline">LESSON 01 · THE QUANTUM STATE</span><h1>What is a qubit?</h1><p>Explore how rotations change a qubit's state. Start at the north pole, then apply a pulse to watch the state vector move.</p></section>
      <div className="layout">
        <section className="canvas-panel"><div className="panel-heading"><h2>Bloch sphere</h2><label className="lock"><input type="checkbox" checked={cameraLocked} onChange={e=>setCameraLocked(e.target.checked)}/> Lock camera</label></div><div className="sphere"><Sphere state={vector} axis={axis} onSelectAxis={setAxis} locked={cameraLocked} busy={busy}/></div><div className="readout"><span>Current state <strong>{stateName(vector)}</strong></span><span>Bloch vector <strong>({vector.map(v=>Math.abs(v)<0.0005?'0':v.toFixed(2)).join(', ')})</strong></span></div></section>
        <section className="controls">
          <h2>Rotation controls</h2><p>Click an X, Y or Z marker on the sphere (or select an axis below), then rotate. Unlock the camera to change your viewpoint.</p>
          <div className="axis-choice" role="group" aria-label="Rotation axis">
          {(['x','y','z'] as const).map(a => <button key={a} className={'axis '+(axis===a?'selected ':'')+a} disabled={busy} onClick={()=>setAxis(a)} aria-pressed={axis===a}>{a.toUpperCase()}</button>)}
          </div>
          <div className="buttons"><button disabled={busy} onClick={()=>pulse(90)}>↻ +90°</button><button disabled={busy} onClick={()=>pulse(-90)}>↺ −90°</button><button disabled={busy} onClick={()=>pulse(180)}>↻ 180°</button></div>
          <div className="custom"><label htmlFor="angle">Custom pulse angle: <strong>{customAngle}°</strong></label><input id="angle" aria-label="Custom rotation angle" type="range" min="-180" max="180" step="5" value={customAngle} disabled={busy} onChange={e=>setCustomAngle(Number(e.target.value))}/><button disabled={busy || customAngle===0} onClick={()=>pulse(customAngle)}>Apply {customAngle>0?"+":""}{customAngle}°</button></div>
          <div className="explanation"><strong>Try this:</strong> Choose Y, then +90°. The state reaches +X. Note: rotating around an axis the arrow already points along produces no visible change—this is correct physics.</div>
          <h2>Pulse history <span className="count">{history.length}</span></h2>
          <div className="sequence" aria-label="Pulse sequence">{history.length ? history.map((p,i)=><span className="gate" key={i}>{p.axis.toUpperCase()} {p.angle>0?'+':''}{p.angle}°</span>) : <span className="empty">No pulses yet. Start with a rotation!</span>}</div>
          <div className="actions"><button disabled={busy||!history.length} onClick={undo}>Undo</button><button disabled={busy||!history.length} onClick={replay}>▶ Replay</button><button disabled={busy} onClick={reset}>Reset</button></div>
          <p className="footnote">A Bloch vector represents a quantum state, not a physical arrow. An X, Y or Z 180° pulse corresponds to a Pauli gate up to global phase.</p>
        </section>
      </div>
    </main><footer>Quantum Explorer · Runs entirely in your browser · Future modules: measurement and entanglement</footer>
  </div>
}
