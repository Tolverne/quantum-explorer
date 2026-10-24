import { useEffect, useRef, useState } from 'react'
import Sphere from './visualization/Sphere'
import { NORTH, apply, rotate, stateName, type Axis, type Pulse, type Vector } from './quantum/bloch'
import { holdDegrees, roundDegrees } from './interaction/hold'

const PULSE_DURATION_MS = 630
type HoldSession = { axis: Axis; from: Vector; started: number; direction: 1 | -1 }

export default function App() {
  const [vector, setVector] = useState<Vector>(NORTH)
  const [history, setHistory] = useState<Pulse[]>([])
  const [axis, setAxis] = useState<Axis>('x')
  const [direction, setDirection] = useState<1 | -1>(1)
  const [busy, setBusy] = useState(false)
  const [cameraLocked, setCameraLocked] = useState(false)
  const [heldAxis, setHeldAxis] = useState<Axis | null>(null)
  const [liveAngle, setLiveAngle] = useState(0)
  const vectorRef = useRef<Vector>(NORTH)
  const busyRef = useRef(false)
  const animationRef = useRef<number | null>(null)
  const holdRef = useRef<HoldSession | null>(null)

  function setInteractionBusy(value: boolean) {
    busyRef.current = value
    setBusy(value)
  }

  // Each frame rotates the ORIGINAL vector, avoiding accumulated numerical drift.
  function animate(command: Pulse): Promise<void> {
    return new Promise(resolve => {
      const from = vectorRef.current
      const started = performance.now()
      const frame = (time: number) => {
        const progress = Math.min(1, Math.max(0, (time - started) / PULSE_DURATION_MS))
        const eased = progress * progress * (3 - 2 * progress)
        setVector(rotate(from, command.axis, command.angle * eased))
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(frame)
        } else {
          vectorRef.current = rotate(from, command.axis, command.angle)
          setVector(vectorRef.current)
          animationRef.current = null
          resolve()
        }
      }
      animationRef.current = requestAnimationFrame(frame)
    })
  }

  async function pulse(angle: number) {
    if (busyRef.current) return
    setInteractionBusy(true)
    const command: Pulse = { axis, angle }
    await animate(command)
    setHistory(previous => [...previous, command])
    setInteractionBusy(false)
  }

  function startHold(pressedAxis: Axis) {
    if (busyRef.current) return
    const session: HoldSession = {
      axis: pressedAxis, from: vectorRef.current,
      started: performance.now(), direction
    }
    holdRef.current = session
    setAxis(pressedAxis)
    setHeldAxis(pressedAxis)
    setLiveAngle(0)
    setInteractionBusy(true)

    const frame = (now: number) => {
      if (holdRef.current !== session) return
      const degrees = holdDegrees(session.started, now, session.direction)
      setVector(rotate(session.from, session.axis, degrees))
      setLiveAngle(degrees)
      animationRef.current = requestAnimationFrame(frame)
    }
    animationRef.current = requestAnimationFrame(frame)
  }

  function finishHold() {
    const session = holdRef.current
    if (!session) return
    holdRef.current = null
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current)
    animationRef.current = null
    const angle = roundDegrees(holdDegrees(session.started, performance.now(), session.direction))
    if (Math.abs(angle) >= 0.1) {
      vectorRef.current = rotate(session.from, session.axis, angle)
      setVector(vectorRef.current)
      setHistory(previous => [...previous, { axis: session.axis, angle }])
    } else {
      setVector(session.from)
    }
    setHeldAxis(null)
    setLiveAngle(0)
    setInteractionBusy(false)
  }

  // Fallbacks for releases outside the canvas, cancelled touches or lost focus.
  useEffect(() => {
    const release = () => finishHold()
    window.addEventListener('pointerup', release)
    window.addEventListener('pointercancel', release)
    window.addEventListener('blur', release)
    return () => {
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', release)
      window.removeEventListener('blur', release)
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  function reset() {
    if (busyRef.current) return
    vectorRef.current = NORTH
    setVector(NORTH)
    setHistory([])
  }

  function undo() {
    if (busyRef.current || !history.length) return
    const previous = history.slice(0, -1)
    const restored = apply(previous)
    setHistory(previous)
    vectorRef.current = restored
    setVector(restored)
  }

  async function replay() {
    if (busyRef.current || !history.length) return
    setInteractionBusy(true)
    const sequence = [...history]
    vectorRef.current = NORTH
    setVector(NORTH)
    for (const command of sequence) await animate(command)
    setInteractionBusy(false)
  }

  const formatted = (angle: number) => (angle > 0 ? '+' : '') + roundDegrees(angle) + '°'

  return <div className="page">
    <header className="header">
      <span className="logo">Q</span>
      <div><strong>Quantum Explorer</strong><span className="subtitle">Visual quantum physics · no sign-in required</span></div>
      <span className="chip">M1 · Bloch Sphere</span>
    </header>
    <main>
      <section className="intro">
        <span className="overline">LESSON 01 · THE QUANTUM STATE</span>
        <h1>What is a qubit?</h1>
        <p>Control a qubit using rotations. Press and hold the coloured X, Y or Z label on the sphere to turn the state arrow; release to save the pulse.</p>
      </section>
      <div className="layout">
        <section className="canvas-panel">
          <div className="panel-heading">
            <div><h2>Bloch sphere</h2><span className="tip">{cameraLocked ? 'View locked' : 'Drag empty space to orbit · Scroll to zoom'}</span></div>
            <label className="lock"><input type="checkbox" checked={cameraLocked} onChange={event => setCameraLocked(event.target.checked)} /> Lock camera</label>
          </div>
          <div className="sphere">
            <Sphere state={vector} heldAxis={heldAxis} onStartHold={startHold} onEndHold={finishHold} locked={cameraLocked} busy={busy} />
          </div>
          <div className="hold-readout" aria-live="off">
            {heldAxis
              ? <><span className="recording-dot"/> Rotating {heldAxis.toUpperCase()}: <strong>{formatted(liveAngle)}</strong> · release to save</>
              : <>Hover over an axis label to highlight it. <strong>Press and hold</strong> to rotate.</>}
          </div>
          <div className="readout">
            <span>Current state <strong>{stateName(vector)}</strong></span>
            <span>Bloch vector <strong>({vector.map(value => Math.abs(value) < 0.0005 ? '0' : value.toFixed(2)).join(', ')})</strong></span>
          </div>
        </section>
        <section className="controls">
          <h2>Rotation controls</h2>
          <p>Hold an axis label on the 3D sphere to rotate continuously. Release your mouse or finger to add that rotation to the sequence.</p>
          <div className="direction-picker" role="group" aria-label="Hold rotation direction">
            <span>Hold direction</span>
            <button type="button" disabled={busy} aria-pressed={direction === 1} className={direction === 1 ? 'selected' : ''} onClick={() => setDirection(1)}>+ Positive</button>
            <button type="button" disabled={busy} aria-pressed={direction === -1} className={direction === -1 ? 'selected' : ''} onClick={() => setDirection(-1)}>− Negative</button>
          </div>
          <h3>Or use fixed pulses</h3>
          <div className="axis-choice" role="group" aria-label="Rotation axis">
            {(['x','y','z'] as const).map(option => <button key={option} type="button" className={'axis ' + (axis === option ? 'selected ' : '') + option} disabled={busy} onClick={() => setAxis(option)} aria-pressed={axis === option}>{option.toUpperCase()}</button>)}
          </div>
          <div className="buttons">
            <button type="button" disabled={busy} onClick={() => pulse(90)}>+90°</button>
            <button type="button" disabled={busy} onClick={() => pulse(-90)}>−90°</button>
            <button type="button" disabled={busy} onClick={() => pulse(180)}>180°</button>
          </div>
          <div className="explanation">
            <strong>Try this:</strong> Hold Y until the arrow reaches +X. Then hold Z and watch it rotate around the equator. If the arrow points along the chosen axis, rotation produces no visible movement — that's correct physics.
          </div>
          <h2>Pulse history <span className="count">{history.length}</span></h2>
          <div className="sequence" aria-label="Pulse sequence">
            {history.length
              ? history.map((command, index) => <span className="gate" key={index}>{command.axis.toUpperCase()} {formatted(command.angle)}</span>)
              : <span className="empty">No pulses yet. Press and hold an axis label!</span>}
          </div>
          <div className="actions">
            <button disabled={busy || !history.length} onClick={undo}>Undo</button>
            <button disabled={busy || !history.length} onClick={replay}>▶ Replay</button>
            <button disabled={busy} onClick={reset}>Reset</button>
          </div>
          <p className="footnote">A Bloch vector represents a quantum state, not a physical arrow. Pauli X/Y/Z correspond to 180° rotations up to global phase.</p>
        </section>
      </div>
    </main>
    <footer>Quantum Explorer · Runs entirely in your browser · Next modules: measurement and entanglement</footer>
  </div>
}
