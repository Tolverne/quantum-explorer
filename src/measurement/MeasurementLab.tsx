import { useEffect, useRef, useState } from 'react'
import Sphere from '../visualization/Sphere'
import { NORTH, rotate, stateName, type Axis, type Pulse, type Vector } from '../quantum/bloch'
import { applyFrom } from '../challenges/challenges'
import { holdDegrees, roundDegrees } from '../interaction/hold'
import {
  BASIS_LABELS, measure, measurementProbabilities, runShots,
  type MeasurementBasis, type MeasurementResult, type ShotCounts
} from '../quantum/measurement'

const DURATION_MS = 630
type HoldSession = { axis: Axis; from: Vector; started: number; direction: 1 | -1 }
const PRESETS: readonly { label: string; description: string; pulses: readonly Pulse[] }[] = [
  { label: '|0⟩', description: 'North pole', pulses: [] },
  { label: '|1⟩', description: 'South pole', pulses: [{ axis: 'x', angle: 180 }] },
  { label: '|+⟩', description: '+X equator', pulses: [{ axis: 'y', angle: 90 }] },
  { label: '|−⟩', description: '−X equator', pulses: [{ axis: 'y', angle: -90 }] }
]

function Bars({ names, counts, expected, total }: {
  names: readonly [string,string]
  counts: readonly [number,number]
  expected: readonly [number,number]
  total: number
}) {
  return <div className="measurement-bars">
    {([0,1] as const).map(i => <div className="measurement-bar-row" key={i}>
      <span className="outcome-label">{names[i]}</span>
      <div className="bar-track" role="img" aria-label={'Observed '+names[i]+': '+counts[i]+' of '+total}>
        <div className="bar-fill" style={{width:(counts[i]/total*100)+'%'}}/>
        <span className="expected-tick" style={{left:(expected[i]*100)+'%'}} title={'Prediction: '+Math.round(expected[i]*100)+'%'}/>
      </div>
      <strong>{counts[i]} <small>({(100*counts[i]/total).toFixed(1)}%)</small></strong>
    </div>)}
  </div>
}

export default function MeasurementLab() {
  const [state, setState] = useState<Vector>(NORTH)
  const [preparation, setPreparation] = useState<Pulse[]>([])
  const [axis, setAxis] = useState<Axis>('y')
  const [direction, setDirection] = useState<1 | -1>(1)
  const [basis, setBasis] = useState<MeasurementBasis>('z')
  const [collapsed, setCollapsed] = useState(false)
  const [singleResults, setSingleResults] = useState<MeasurementResult[]>([])
  const [shotCount, setShotCount] = useState<10 | 100 | 1000>(100)
  const [batch, setBatch] = useState<ShotCounts | null>(null)
  const [cameraLocked, setCameraLocked] = useState(false)
  const [busy, setBusy] = useState(false)
  const [heldAxis, setHeldAxis] = useState<Axis | null>(null)
  const [liveAngle, setLiveAngle] = useState(0)

  const stateRef = useRef<Vector>(NORTH)
  const preparationRef = useRef<Pulse[]>([])
  const busyRef = useRef(false)
  const animationRef = useRef<number | null>(null)
  const holdRef = useRef<HoldSession | null>(null)

  const preparedState = applyFrom(NORTH, preparation)
  const names = BASIS_LABELS[basis]
  const currentPredictions = measurementProbabilities(state, basis)
  const preparedPredictions = measurementProbabilities(preparedState, basis)
  const label = (value: number) => (value > 0 ? '+' : '') + roundDegrees(value) + '°'

  function lock(value: boolean) {
    busyRef.current = value
    setBusy(value)
  }
  function resetExperiment(pulses: readonly Pulse[]) {
    if (busyRef.current) return
    const next = [...pulses]
    const start = applyFrom(NORTH,next)
    preparationRef.current = next
    setPreparation(next)
    stateRef.current = start
    setState(start)
    setCollapsed(false)
    setSingleResults([])
    setBatch(null)
  }
  function restorePrepared() {
    if (busyRef.current) return
    const start = applyFrom(NORTH,preparationRef.current)
    stateRef.current = start
    setState(start)
    setCollapsed(false)
    setSingleResults([])
  }
  function changeBasis(next: MeasurementBasis) {
    if (busyRef.current) return
    setBasis(next)
    setBatch(null)
    // Keep the actual qubit as it is: changing the measuring device
    // must not reset or otherwise alter its quantum state.
  }

  function animatePulse(command: Pulse): Promise<void> {
    return new Promise(resolve => {
      const from = stateRef.current
      const started = performance.now()
      const step = (now:number) => {
        const t = Math.min(1, Math.max(0, (now-started)/DURATION_MS))
        const ease = t*t*(3-2*t)
        setState(rotate(from,command.axis,command.angle*ease))
        if (t<1) animationRef.current=requestAnimationFrame(step)
        else {
          const final = rotate(from,command.axis,command.angle)
          stateRef.current=final
          setState(final)
          animationRef.current=null
          resolve()
        }
      }
      animationRef.current=requestAnimationFrame(step)
    })
  }
  function commit(command: Pulse) {
    preparationRef.current=[...preparationRef.current,command]
    setPreparation(preparationRef.current)
    setBatch(null)
    setSingleResults([])
  }
  async function fixedPulse(angle:number) {
    if (busyRef.current || collapsed) return
    lock(true)
    const command={axis,angle}
    await animatePulse(command)
    commit(command)
    lock(false)
  }
  function startHold(pressedAxis:Axis) {
    if (busyRef.current || collapsed) return
    const session:HoldSession={axis:pressedAxis,from:stateRef.current,started:performance.now(),direction}
    holdRef.current=session
    setAxis(pressedAxis)
    setHeldAxis(pressedAxis)
    setLiveAngle(0)
    lock(true)
    const step=(now:number)=>{
      if (holdRef.current!==session) return
      const angle=holdDegrees(session.started,now,session.direction)
      setState(rotate(session.from,session.axis,angle))
      setLiveAngle(angle)
      animationRef.current=requestAnimationFrame(step)
    }
    animationRef.current=requestAnimationFrame(step)
  }
  function finishHold() {
    const session=holdRef.current
    if (!session) return
    holdRef.current=null
    if(animationRef.current!==null) cancelAnimationFrame(animationRef.current)
    animationRef.current=null
    const angle=roundDegrees(holdDegrees(session.started,performance.now(),session.direction))
    if(Math.abs(angle)>=0.1){
      const command={axis:session.axis,angle}
      stateRef.current=rotate(session.from,session.axis,angle)
      setState(stateRef.current)
      commit(command)
    } else setState(session.from)
    setHeldAxis(null)
    setLiveAngle(0)
    lock(false)
  }
  useEffect(()=>{
    const release=()=>finishHold()
    window.addEventListener('pointerup',release)
    window.addEventListener('pointercancel',release)
    window.addEventListener('blur',release)
    return ()=>{
      window.removeEventListener('pointerup',release)
      window.removeEventListener('pointercancel',release)
      window.removeEventListener('blur',release)
      if(animationRef.current!==null)cancelAnimationFrame(animationRef.current)
    }
  },[])

  function undo() {
    if (busyRef.current || collapsed || !preparationRef.current.length) return
    const previous=preparationRef.current.slice(0,-1)
    resetExperiment(previous)
  }
  function measureOnce() {
    if (busyRef.current) return
    const result=measure(stateRef.current,basis)
    stateRef.current=result.after
    setState(result.after)
    setCollapsed(true)
    setSingleResults(previous=>[...previous,result])
  }
  function measureBatch() {
    if (busyRef.current) return
    // Every shot starts from the PREPARED state, not the collapsed live state.
    setBatch(runShots(applyFrom(NORTH,preparationRef.current),basis,shotCount))
  }

  const last=singleResults[singleResults.length-1]
  return <section className="measurement-module" aria-label="Quantum Measurement Lab">
    <div className="measurement-intro">
      <div>
        <span className="overline">LESSON 02 · QUANTUM MEASUREMENT</span>
        <h2>Prepare → Measure → Compare</h2>
        <p>A state tells us what outcomes are possible and their probabilities. One measurement gives just one result. Try the same preparation many times to discover the pattern.</p>
      </div>
      <div className="measurement-task">
        <strong>Try this investigation</strong>
        <span>Prepare |+⟩, measure in Z, and repeat 100 times. Then change to X. What changes?</span>
      </div>
    </div>
    <div className="measurement-layout">
      <section className="measurement-sphere-card">
        <div className="panel-heading">
          <div><h2>Qubit state</h2><span className="tip">{cameraLocked ? 'View locked' : 'Drag empty space to orbit'}</span></div>
          <label className="lock"><input type="checkbox" checked={cameraLocked} onChange={event=>setCameraLocked(event.target.checked)}/> Lock camera</label>
        </div>
        <div className="sphere">
          <Sphere state={state} target={collapsed?preparedState:undefined}
            allowedAxes={['x','y','z']} heldAxis={heldAxis}
            onStartHold={startHold} onEndHold={finishHold}
            locked={cameraLocked} busy={busy || collapsed}/>
        </div>
        {collapsed && <div className="target-legend"><span className="swatch actual"/> Gold: state after measurement <span className="swatch goal"/> Cyan: state you prepared</div>}
        <div className="hold-readout">
          {heldAxis ? <>Applying {heldAxis.toUpperCase()} rotation: <strong>{label(liveAngle)}</strong></> :
            collapsed ? <>The qubit has been measured. <strong>Prepare again</strong> to repeat from the original state.</> :
              <>Press and hold an axis label to rotate, or choose a prepared state below.</>}
        </div>
        <div className="readout">
          <span>Live qubit: <strong>{stateName(state)}</strong></span>
          <span>Prepared: <strong>{stateName(preparedState)}</strong></span>
        </div>
      </section>
      <div className="measurement-right">
        <section className="measurement-panel" aria-label="Prepare a quantum state">
          <h3><span className="step-number">1</span> Prepare a state</h3>
          <p>Use a preset or make your own with the rotation controls.</p>
          <div className="preset-buttons">
            {PRESETS.map(preset=><button type="button" key={preset.label} disabled={busy}
              title={preset.description} onClick={()=>resetExperiment(preset.pulses)}>{preset.label}</button>)}
          </div>
          <div className="direction-picker" role="group" aria-label="Hold rotation direction">
            <span>Hold direction</span>
            <button disabled={busy || collapsed} className={direction===1?'selected':''} aria-pressed={direction===1} onClick={()=>setDirection(1)}>+ Positive</button>
            <button disabled={busy || collapsed} className={direction===-1?'selected':''} aria-pressed={direction===-1} onClick={()=>setDirection(-1)}>− Negative</button>
          </div>
          <div className="axis-choice" role="group" aria-label="Gate axis">
            {(['x','y','z'] as const).map(a=><button type="button" key={a}
              className={'axis '+(axis===a?'selected ':'')+a} aria-pressed={axis===a}
              disabled={busy || collapsed} onClick={()=>setAxis(a)}>{a.toUpperCase()}</button>)}
          </div>
          <div className="buttons">
            <button disabled={busy || collapsed} onClick={()=>fixedPulse(90)}>+90°</button>
            <button disabled={busy || collapsed} onClick={()=>fixedPulse(-90)}>−90°</button>
            <button disabled={busy || collapsed} onClick={()=>fixedPulse(180)}>180°</button>
          </div>
          <div className="measurement-sequence"><strong>Preparation:</strong> {preparation.length===0?'|0⟩ (no pulses)':preparation.map((p,i)=><span className="gate" key={i}>{p.axis.toUpperCase()} {label(p.angle)}</span>)}</div>
          <div className="measurement-small-actions">
            <button disabled={busy || collapsed || !preparation.length} onClick={undo}>Undo pulse</button>
            <button disabled={busy} onClick={restorePrepared}>Prepare again</button>
            <button disabled={busy} onClick={()=>resetExperiment([])}>Reset to |0⟩</button>
          </div>
        </section>
        <section className="measurement-panel" aria-label="Choose measurement basis">
          <h3><span className="step-number">2</span> Choose how to measure</h3>
          <p>The measuring axis matters. Changing it does not change the qubit until a measurement is made.</p>
          <div className="basis-buttons" role="group" aria-label="Measurement basis">
            <button className={basis==='z'?'selected':''} aria-pressed={basis==='z'} onClick={()=>changeBasis('z')} disabled={busy}>Z basis <small>0 / 1</small></button>
            <button className={basis==='x'?'selected':''} aria-pressed={basis==='x'} onClick={()=>changeBasis('x')} disabled={busy}>X basis <small>+ / −</small></button>
          </div>
          <p className="probability-heading">Predicted probabilities for the live qubit:</p>
          <div className="prediction-bars">
            {([0,1] as const).map(i=><div className="prediction-row" key={i}>
              <span>{names[i]}</span><div className="prediction-track"><div style={{width:(currentPredictions[i]*100)+'%'}}/></div>
              <strong>{(currentPredictions[i]*100).toFixed(1)}%</strong>
            </div>)}
          </div>
        </section>
      </div>
    </div>
    <div className="experiment-columns">
      <section className="measurement-panel" aria-label="Single qubit measurement">
        <h3><span className="step-number">3a</span> Measure this one qubit</h3>
        <p>Measure once, then measure <em>the same qubit</em> again without preparing it again. Does the second measurement have to match?</p>
        <button type="button" className="measure-primary" disabled={busy} onClick={measureOnce}>
          {collapsed?'Measure same qubit again':'Measure one qubit'}
        </button>
        {last ? <div className="last-outcome" role="status">
          <span>Most recent outcome</span>
          <strong>{BASIS_LABELS[last.basis][last.outcome]}</strong>
          <small>{last.basis.toUpperCase()}-basis outcome; its predicted chance before this measurement was {(last.probability*100).toFixed(1)}%. The qubit collapsed onto {last.basis.toUpperCase()}{last.outcome===0?'+':'−'}. {singleResults.length} measurement{singleResults.length===1?'':'s'} on this one qubit.</small>
        </div>:<div className="measurement-empty">No measurement yet. Predict what you will observe before clicking.</div>}
        {singleResults.length>0 && <div className="single-log"><strong>Outcome sequence:</strong>{singleResults.slice(-16).map((item,i)=><span key={i} title={item.basis.toUpperCase()+' basis'}>{item.basis.toUpperCase()}:{BASIS_LABELS[item.basis][item.outcome]}</span>)}</div>}
        <button type="button" className="secondary-measure" disabled={busy} onClick={restorePrepared}>Re-prepare this qubit</button>
        <p className="measurement-note">After an ideal projective measurement, repeating the <strong>same basis</strong> immediately gives the same result. Switching bases can make it unpredictable again.</p>
      </section>
      <section className="measurement-panel" aria-label="Repeated preparation experiment">
        <h3><span className="step-number">3b</span> Run many separate trials</h3>
        <p>Each trial starts with a <strong>freshly prepared copy</strong> of your original state, even if the live qubit above has already collapsed.</p>
        <div className="shot-actions">
          <label htmlFor="shots">Number of trials</label>
          <select id="shots" value={shotCount} onChange={e=>setShotCount(Number(e.target.value) as 10 | 100 | 1000)}>
            <option value={10}>10</option><option value={100}>100</option><option value={1000}>1000</option>
          </select>
          <button type="button" className="measure-primary" disabled={busy} onClick={measureBatch}>Run experiment</button>
        </div>
        {batch ? <>
          <Bars names={BASIS_LABELS[batch.basis]} counts={batch.counts} expected={batch.expected} total={batch.total}/>
          <div className="chart-legend"><span className="legend-observed"/> Measured frequency <span className="legend-expected"/> Predicted probability</div>
          <p className="measurement-note" role="status">Result: {batch.counts[0]} of {batch.total} freshly prepared qubits gave {BASIS_LABELS[batch.basis][0]}. Repeat to see sampling variation.</p>
        </> : <>
          <div className="measurement-empty">Run several shots to compare a distribution of observed outcomes with the probability prediction.</div>
          <div className="prediction-preview">Prediction for prepared state: <strong>{names[0]} {(preparedPredictions[0]*100).toFixed(1)}%</strong> / <strong>{names[1]} {(preparedPredictions[1]*100).toFixed(1)}%</strong></div>
        </>}
      </section>
    </div>
    <div className="measurement-explainer">
      <strong>Two different experiments</strong>
      <p><b>3a:</b> One qubit is measured and its state changes. A repeat measurement uses that new state. <b>3b:</b> Every shot begins with the same original preparation. The pattern approaches the probabilities as the number of shots increases. These are ideal simulated experiments, not runs on the NQCT hardware.</p>
    </div>
  </section>
}
