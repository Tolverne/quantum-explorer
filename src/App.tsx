import { useEffect, useRef, useState } from 'react'
import Sphere from './visualization/Sphere'
import MeasurementLab from './measurement/MeasurementLab'
import EntanglementLab from './entanglement/EntanglementLab'
import { NORTH, rotate, stateName, type Axis, type Pulse, type Vector } from './quantum/bloch'
import { holdDegrees, roundDegrees } from './interaction/hold'
import { CHALLENGES, applyFrom, checkChallenge, type Challenge } from './challenges/challenges'

const PULSE_DURATION_MS = 630
type HoldSession = { axis: Axis; from: Vector; started: number; direction: 1 | -1 }
type Mode = 'explore' | 'challenge' | 'measurement' | 'entanglement'

export default function App() {
  const [vector, setVector] = useState<Vector>(NORTH)
  const [history, setHistory] = useState<Pulse[]>([])
  const [axis, setAxis] = useState<Axis>('x')
  const [direction, setDirection] = useState<1 | -1>(1)
  const [busy, setBusy] = useState(false)
  const [cameraLocked, setCameraLocked] = useState(false)
  const [heldAxis, setHeldAxis] = useState<Axis | null>(null)
  const [liveAngle, setLiveAngle] = useState(0)

  const [mode, setMode] = useState<Mode>('challenge')
  const [challengeIndex, setChallengeIndex] = useState(0)
  const [hintVisible, setHintVisible] = useState(false)
  const [assessment, setAssessment] = useState<ReturnType<typeof checkChallenge> | null>(null)
  const [completed, setCompleted] = useState<ReadonlySet<string>>(() => new Set())

  const vectorRef = useRef<Vector>(NORTH)
  const busyRef = useRef(false)
  const animationRef = useRef<number | null>(null)
  const holdRef = useRef<HoldSession | null>(null)

  const challenge: Challenge = CHALLENGES[challengeIndex]
  const start: Vector = mode === 'challenge' ? challenge.start : NORTH
  const permittedAxes: readonly Axis[] = mode === 'challenge' ? challenge.allowedAxes : ['x','y','z']
  const axisAllowed = permittedAxes.includes(axis)
  const formatted = (angle: number) => (angle > 0 ? '+' : '') + roundDegrees(angle) + '°'

  function setInteractionBusy(value: boolean) {
    busyRef.current = value
    setBusy(value)
  }

  function setStartingState(next: Vector) {
    vectorRef.current = next
    setVector(next)
    setHistory([])
    setAssessment(null)
    setHeldAxis(null)
    setLiveAngle(0)
  }

  function chooseMode(next: Mode) {
    if (busyRef.current || next === mode) return
    setMode(next)
    setHintVisible(false)
    setAxis(next === 'challenge' ? challenge.allowedAxes[0] : 'x')
    setStartingState(next === 'challenge' ? challenge.start : NORTH)
  }

  function chooseChallenge(index: number) {
    if (busyRef.current || index < 0 || index >= CHALLENGES.length) return
    const selected = CHALLENGES[index]
    setMode('challenge')
    setChallengeIndex(index)
    setAxis(selected.allowedAxes[0])
    setHintVisible(false)
    setStartingState(selected.start)
  }

  // Interpolate one rotation from its original state, not from the previous frame.
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
    if (busyRef.current || !axisAllowed) return
    setInteractionBusy(true)
    const command: Pulse = { axis, angle }
    await animate(command)
    setHistory(previous => [...previous, command])
    setAssessment(null)
    setInteractionBusy(false)
  }

  function startHold(pressedAxis: Axis) {
    if (busyRef.current || !permittedAxes.includes(pressedAxis)) return
    const session: HoldSession = {
      axis: pressedAxis, from: vectorRef.current,
      started: performance.now(), direction
    }
    holdRef.current = session
    setAxis(pressedAxis)
    setHeldAxis(pressedAxis)
    setLiveAngle(0)
    setAssessment(null)
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
    setStartingState(start)
  }

  function undo() {
    if (busyRef.current || !history.length) return
    const previous = history.slice(0, -1)
    const restored = applyFrom(start, previous)
    setHistory(previous)
    vectorRef.current = restored
    setVector(restored)
    setAssessment(null)
  }

  async function replay() {
    if (busyRef.current || !history.length) return
    setInteractionBusy(true)
    const sequence = [...history]
    vectorRef.current = start
    setVector(start)
    for (const command of sequence) await animate(command)
    setInteractionBusy(false)
  }

  function checkResult() {
    if (busyRef.current || mode !== 'challenge') return
    const result = checkChallenge(challenge, vectorRef.current, history)
    setAssessment(result)
    if (result.success) {
      setCompleted(previous => new Set([...previous, challenge.id]))
    }
  }

  return <div className="page">
    <header className="header">
      <span className="logo">Q</span>
      <div><strong>Quantum Explorer</strong><span className="subtitle">Visual quantum physics · no sign-in required</span></div>
      <span className="chip">M4 · Entanglement</span>
    </header>
    <main>
      <section className="intro">
        <span className="overline">{mode === 'entanglement' ? 'LESSON 03 · ENTANGLEMENT' : mode === 'measurement' ? 'LESSON 02 · QUANTUM MEASUREMENT' : 'LESSON 01 · THE QUANTUM STATE'}</span>
        <h1>{mode === 'entanglement' ? 'What is entanglement?' : mode === 'measurement' ? 'What happens when we measure?' : 'What is a qubit?'}</h1>
        <p>{mode === 'entanglement' ? 'Explore correlations between two qubits and discover the difference between classical pairs and Bell states.' : mode === 'measurement' ? 'Prepare a quantum state, observe individual results and compare repeated measurements with predictions.' : 'Discover quantum rotations by moving the Bloch vector. In Challenge mode, try to match the translucent target arrow using as few pulses as you can.'}</p>
        <div className="mode-switch" role="group" aria-label="Explorer mode">
          <button type="button" className={mode === 'challenge' ? 'selected' : ''} aria-pressed={mode === 'challenge'} disabled={busy} onClick={() => chooseMode('challenge')}>🎯 Challenges</button>
          <button type="button" className={mode === 'explore' ? 'selected' : ''} aria-pressed={mode === 'explore'} disabled={busy} onClick={() => chooseMode('explore')}>Free explorer</button>
          <button type="button" className={mode === 'measurement' ? 'selected' : ''} aria-pressed={mode === 'measurement'} disabled={busy} onClick={() => chooseMode('measurement')}>Measurement lab</button>
          <button type="button" className={mode === 'entanglement' ? 'selected' : ''} aria-pressed={mode === 'entanglement'} disabled={busy} onClick={() => chooseMode('entanglement')}>Entanglement lab</button>
        </div>
      </section>
      {mode === 'challenge' && <section className="challenge-panel" aria-label="Bloch sphere challenges">
        <div className="challenge-topline">
          <span className="overline">MISSION {challengeIndex + 1} OF {CHALLENGES.length}</span>
          <span className="progress-count">{completed.size} / {CHALLENGES.length} completed this session</span>
        </div>
        <div className="challenge-nav" aria-label="Choose a challenge">
          {CHALLENGES.map((item, index) => <button
            type="button" key={item.id} disabled={busy}
            className={(index === challengeIndex ? 'selected ' : '') + (completed.has(item.id) ? 'complete' : '')}
            aria-current={index === challengeIndex ? 'step' : undefined}
            aria-label={'Challenge ' + (index + 1) + ': ' + item.title + (completed.has(item.id) ? ', completed' : '')}
            onClick={() => chooseChallenge(index)}
          >{completed.has(item.id) ? '✓' : index + 1}</button>)}
        </div>
        <div className="challenge-details">
          <div>
            <h2>{challenge.title}</h2>
            <p>{challenge.prompt}</p>
            <div className="challenge-tags">
              <span>Start: <strong>{challenge.startLabel}</strong></span>
              <span>Target: <strong>{challenge.targetLabel}</strong></span>
              <span>Allowed: <strong>{permittedAxes.map(a => a.toUpperCase()).join(' and ')}</strong></span>
              <span>Example solution: <strong>{challenge.examplePulses} {challenge.examplePulses === 1 ? 'pulse' : 'pulses'}</strong></span>
            </div>
          </div>
          <div className="challenge-actions">
            <button type="button" disabled={busy} className="hint-button" onClick={() => setHintVisible(v => !v)}>{hintVisible ? 'Hide hint' : 'Show hint'}</button>
            <button type="button" disabled={busy || history.length === 0} className="check-button" onClick={checkResult}>Check my state</button>
            {challengeIndex < CHALLENGES.length - 1 && <button type="button" className="next-button" disabled={busy} onClick={() => chooseChallenge(challengeIndex + 1)}>Next →</button>}
          </div>
        </div>
        {hintVisible && <p className="hint-text">Hint: {challenge.hint}</p>}
        {assessment && <div role="status" className={'result-banner ' + (assessment.success ? 'success' : 'not-yet')}>
          {assessment.success
            ? <><strong>Target reached!</strong> Your Bloch vector is within {assessment.angle.toFixed(1)}° of the target. You used {assessment.pulseCount} {assessment.pulseCount === 1 ? 'pulse' : 'pulses'}{assessment.efficient ? ' — as few as the example solution.' : '. Can you find a shorter route?'}</>
            : <><strong>Not quite there.</strong> You are {assessment.angle.toFixed(1)}° from the target. Adjust the rotation or try Undo, then check again.</>}
        </div>}
      </section>}
      {mode === 'measurement' && <MeasurementLab/>}
      {mode === 'entanglement' && <EntanglementLab/>}
      {(mode === 'challenge' || mode === 'explore') && <div className="layout">
        <section className="canvas-panel">
          <div className="panel-heading">
            <div><h2>Bloch sphere</h2><span className="tip">{cameraLocked ? 'View locked' : 'Drag empty space to orbit · Scroll to zoom'}</span></div>
            <label className="lock"><input type="checkbox" checked={cameraLocked} onChange={event => setCameraLocked(event.target.checked)} /> Lock camera</label>
          </div>
          <div className="sphere">
            <Sphere state={vector} target={mode === 'challenge' ? challenge.target : undefined}
              heldAxis={heldAxis} allowedAxes={permittedAxes} onStartHold={startHold}
              onEndHold={finishHold} locked={cameraLocked} busy={busy}/>
          </div>
          {mode === 'challenge' && <div className="target-legend"><span className="swatch actual"/> Gold: your qubit <span className="swatch goal"/> Cyan: target (ghost arrow)</div>}
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
          <p>Hold an axis label on the 3D sphere to rotate continuously. Release your mouse or finger to save exactly one pulse.</p>
          <div className="direction-picker" role="group" aria-label="Hold rotation direction">
            <span>Hold direction</span>
            <button type="button" disabled={busy} aria-pressed={direction === 1} className={direction === 1 ? 'selected' : ''} onClick={() => setDirection(1)}>+ Positive</button>
            <button type="button" disabled={busy} aria-pressed={direction === -1} className={direction === -1 ? 'selected' : ''} onClick={() => setDirection(-1)}>− Negative</button>
          </div>
          <h3>Or use fixed pulses</h3>
          <div className="axis-choice" role="group" aria-label="Rotation axis">
            {(['x','y','z'] as const).map(option => <button key={option} type="button"
              className={'axis ' + (axis === option ? 'selected ' : '') + option}
              disabled={busy || !permittedAxes.includes(option)}
              onClick={() => setAxis(option)} aria-pressed={axis === option}>{option.toUpperCase()}</button>)}
          </div>
          <div className="buttons">
            <button type="button" disabled={busy || !axisAllowed} onClick={() => pulse(90)}>+90°</button>
            <button type="button" disabled={busy || !axisAllowed} onClick={() => pulse(-90)}>−90°</button>
            <button type="button" disabled={busy || !axisAllowed} onClick={() => pulse(180)}>180°</button>
          </div>
          <div className="explanation">
            <strong>Try this:</strong> First use a fixed 90° pulse. Then press and hold an axis on the sphere to make a smaller adjustment. Rotating around an axis the arrow already points along produces no visible change.
          </div>
          <h2>Pulse history <span className="count">{history.length}</span></h2>
          <div className="sequence" aria-label="Pulse sequence">
            {history.length
              ? history.map((command, index) => <span className="gate" key={index}>{command.axis.toUpperCase()} {formatted(command.angle)}</span>)
              : <span className="empty">{mode === 'challenge' ? 'Start at ' + challenge.startLabel + ' and reach ' + challenge.targetLabel : 'No pulses yet. Press and hold an axis label!'}</span>}
          </div>
          <div className="actions">
            <button type="button" disabled={busy || !history.length} onClick={undo}>Undo</button>
            <button type="button" disabled={busy || !history.length} onClick={replay}>▶ Replay</button>
            <button type="button" disabled={busy} onClick={reset}>Reset</button>
          </div>
          <p className="footnote">A Bloch vector represents a quantum state, not a physical arrow. Pauli X/Y/Z correspond to 180° rotations up to global phase. Challenges compare quantum states, not your camera angle.</p>
        </section>
      </div>}
    </main>
    <footer>Quantum Explorer · Runs entirely in your browser · Explore qubits, measurement and entanglement</footer>
  </div>
}
