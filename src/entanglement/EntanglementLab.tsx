import { useMemo, useState } from 'react'
import Sphere from '../visualization/Sphere'
import type { Vector } from '../quantum/bloch'
import type { MeasurementBasis, Outcome } from '../quantum/measurement'
import { BASIS_LABELS } from '../quantum/measurement'
import {
  preparePair, marginalBloch, jointProbabilities, measureAlice, measureBob,
  runPairShots, correlation, OUTCOMES, outcomeLabel, type Density,
  type PairBatch, type PairPreparation
} from '../quantum/entanglement'

const DETAILS: readonly {key:PairPreparation;label:string;description:string;preparation:string}[]=[
  {key:'independent',label:'Independent',description:'Both qubits start in |+⟩. They are separate, not linked.',preparation:'H on Alice, H on Bob'},
  {key:'classical',label:'Classical pair',description:'Half the pairs are 00; half are 11. We do not know which pair was sent.',preparation:'50% |00⟩, 50% |11⟩'},
  {key:'bell-plus',label:'Bell pair Φ+',description:'A joint state (|00⟩ + |11⟩)/√2, made using H then CNOT.',preparation:'H(A) → CNOT(A→B)'},
  {key:'bell-minus',label:'Bell pair Φ−',description:'A joint state (|00⟩ − |11⟩)/√2. Its X correlation is reversed.',preparation:'H(A) → CNOT(A→B) → Z(A)'}
]
const NO_AXIS=[] as const
const notUsed=()=>{}
type Stage='ready'|'alice'|'both'
type OutcomeRecord={outcome:Outcome;basis:MeasurementBasis;probability:number}
type Evidence=Partial<Record<'zz'|'xx',{same:number;corr:number;count:number}>>
const fmt=(v:number)=>Math.round(v*100)+'%'
const preparedState=(kind:PairPreparation)=>preparePair(kind)

function SphereCard({title,bloch,subtitle}:{title:string;bloch:Vector;subtitle:string}) {
  const mixed=Math.hypot(...bloch)<1e-5
  return <section className="pair-sphere-card">
    <div className="pair-sphere-heading"><strong>{title}</strong><span>{mixed?'Locally random':'Bloch vector'}</span></div>
    <div className="pair-sphere-visual">
      <Sphere state={bloch} allowedAxes={NO_AXIS} axesDisabled heldAxis={null}
        onStartHold={notUsed} onEndHold={notUsed} locked={false} busy={false}/>
    </div>
    <div className="pair-sphere-note">{mixed?<><strong>Centre point:</strong> No definite single-qubit direction.</>:subtitle}</div>
  </section>
}
export default function EntanglementLab(){
  const [kind,setKind]=useState<PairPreparation>('bell-plus')
  const [basisA,setBasisA]=useState<MeasurementBasis>('z')
  const [basisB,setBasisB]=useState<MeasurementBasis>('z')
  const [stage,setStage]=useState<Stage>('ready')
  const [current,setCurrent]=useState<Density>(()=>preparedState('bell-plus'))
  const [aRecord,setARecord]=useState<OutcomeRecord|null>(null)
  const [bRecord,setBRecord]=useState<OutcomeRecord|null>(null)
  const [shotCount,setShotCount]=useState<10|100|1000>(100)
  const [batch,setBatch]=useState<PairBatch|null>(null)
  const [evidence,setEvidence]=useState<Evidence>({})
  const [showTeacher,setShowTeacher]=useState(false)

  const info=DETAILS.find(item=>item.key===kind)!
  const original=useMemo(()=>preparedState(kind),[kind])
  const ideal=useMemo(()=>jointProbabilities(original,basisA,basisB),[original,basisA,basisB])
  const aliceBloch=marginalBloch(current,'alice')
  const bobBloch=marginalBloch(current,'bob')
  const theoreticalZZ=correlation(jointProbabilities(original,'z','z'))
  const theoreticalXX=correlation(jointProbabilities(original,'x','x'))
  const theoreticalScore=theoreticalZZ+theoreticalXX

  function reprepare() {
    setCurrent(preparedState(kind))
    setStage('ready')
    setARecord(null)
    setBRecord(null)
  }
  function chooseKind(next:PairPreparation){
    setKind(next)
    setCurrent(preparedState(next))
    setStage('ready')
    setARecord(null)
    setBRecord(null)
    setBatch(null)
    setEvidence({})
  }
  function chooseBasis(which:'a'|'b',basis:MeasurementBasis){
    if(stage!=='ready')return
    if(which==='a')setBasisA(basis)
    else setBasisB(basis)
    setBatch(null)
  }
  function takeAlice(){
    if(stage!=='ready')return
    const result=measureAlice(current,basisA)
    setCurrent(result.post)
    setARecord({outcome:result.outcome,basis:basisA,probability:result.probability})
    setStage('alice')
  }
  function takeBob(){
    if(stage!=='alice')return
    const result=measureBob(current,basisB)
    setCurrent(result.post)
    setBRecord({outcome:result.outcome,basis:basisB,probability:result.probability})
    setStage('both')
  }
  function runBatch(){
    const result=runPairShots(original,basisA,basisB,shotCount)
    setBatch(result)
    if(basisA===basisB){
      const key=basisA==='z'?'zz':'xx'
      const same=(result.outcomes[0]+result.outcomes[3])/result.count
      setEvidence(prev=>({...prev,[key]:{same,corr:correlation(result.outcomes.map(n=>n/result.count)),count:result.count}}))
    }
  }
  const hasBoth=evidence.zz!==undefined&&evidence.xx!==undefined
  const experimentalScore=hasBoth?evidence.zz!.corr+evidence.xx!.corr:null
  const currentJoint=stage==='both'&&aRecord&&bRecord?outcomeLabel([aRecord.outcome,bRecord.outcome],aRecord.basis,bRecord.basis):null
  return <section className="entanglement-lab" aria-label="Entanglement Lab">
    <div className="entanglement-intro">
      <span className="overline">LESSON 03 · QUANTUM ENTANGLEMENT</span>
      <h2>Can two qubits share a quantum state?</h2>
      <p>Individual measurements can look random while pairs show a striking pattern. Compare independent, classically correlated, and entangled pairs by changing how each qubit is measured.</p>
      <div className="investigation-prompt"><strong>Detective challenge:</strong> First measure both qubits in Z. Then measure fresh pairs in X. Can you tell the classical pair from a Bell pair?</div>
    </div>

    <section className="pair-panel">
      <div className="pair-section-title"><span className="pair-step">1</span><div><h3>Prepare two qubits</h3><p>Choose how the pair is prepared. The statistics below use the same preparation each time.</p></div></div>
      <div className="pair-presets">
        {DETAILS.map(item=><button type="button" key={item.key} onClick={()=>chooseKind(item.key)}
          className={kind===item.key?'selected':''} aria-pressed={kind===item.key}>
          <strong>{item.label}</strong><small>{item.description}</small>
        </button>)}
      </div>
      <div className="pair-prep-description"><strong>Preparation:</strong> {info.preparation}</div>
      <div className="pair-gate-circuit" aria-label="Circuit preparation explanation">
        {kind==='bell-plus'||kind==='bell-minus'?<div className="circuit-diagram">
          <div className="circuit-row"><span>A |0⟩</span><i/><b>H</b><i/><b className="control-node">●</b><i/>{kind==='bell-minus'&&<><b>Z</b><i/></>}</div>
          <div className="circuit-row"><span>B |0⟩</span><i/><i className="empty-step"/><i/><b className="cnot-target">⊕</b><i/>{kind==='bell-minus'&&<><i className="empty-step"/><i/></>}</div>
          <div className="cnot-vertical"/>
        </div>:<p>{kind==='classical'?'A random classical choice prepares |00⟩ or |11⟩ with equal probability. This is a mixture, not a coherent Bell superposition.':'Two independent H gates prepare |+⟩ on Alice and |+⟩ on Bob.'}</p>}
      </div>
    </section>

    <div className="pair-display">
      <SphereCard title="Alice's qubit" bloch={aliceBloch} subtitle={'Local Bloch vector: ('+aliceBloch.map(v=>v.toFixed(2)).join(', ')+')'}/>
      <SphereCard title="Bob's qubit" bloch={bobBloch} subtitle={'Local Bloch vector: ('+bobBloch.map(v=>v.toFixed(2)).join(', ')+')'}/>
    </div>
    <div className="pair-explanation">
      <strong>Why might the arrow be at the centre?</strong> Each qubit in a Bell pair has an individually maximally mixed state. Its reduced Bloch vector is the centre point, not a full-length arrow. The quantum information is in the <em>joint state and correlations</em> between Alice and Bob.
    </div>

    <section className="pair-panel">
      <div className="pair-section-title"><span className="pair-step">2</span><div><h3>Choose measurement bases</h3><p>Each researcher may measure along Z (0/1) or X (+/−). Choose the axes before measuring this pair.</p></div></div>
      <div className="pair-bases">
        {(['a','b'] as const).map(which=><div key={which}>
          <strong>{which==='a'?'Alice':'Bob'}</strong>
          <div className="pair-basis-buttons">
            {(['z','x'] as const).map(b=><button key={b} disabled={stage!=='ready'} aria-pressed={(which==='a'?basisA:basisB)===b}
              className={(which==='a'?basisA:basisB)===b?'selected':''}
              onClick={()=>chooseBasis(which,b)}>{b.toUpperCase()} <small>{b==='z'?'0/1':'+/−'}</small></button>)}
          </div>
        </div>)}
      </div>
    </section>

    <div className="pair-experiments">
      <section className="pair-panel">
        <div className="pair-section-title"><span className="pair-step">3a</span><div><h3>Measure one pair</h3><p>Measure Alice, inspect Bob's conditional state, and then measure Bob.</p></div></div>
        <div className="pair-single-results">
          <div className="pair-person"><span>Alice ({basisA.toUpperCase()})</span><strong>{aRecord?BASIS_LABELS[aRecord.basis][aRecord.outcome]:'?'}</strong></div>
          <div className="pair-person"><span>Bob ({basisB.toUpperCase()})</span><strong>{bRecord?BASIS_LABELS[bRecord.basis][bRecord.outcome]:'?'}</strong></div>
        </div>
        <div className="pair-action-buttons">
          {stage==='ready'&&<button className="pair-primary" onClick={takeAlice}>Measure Alice</button>}
          {stage==='alice'&&<button className="pair-primary" onClick={takeBob}>Measure Bob</button>}
          <button onClick={reprepare}>Prepare new pair</button>
        </div>
        {stage==='alice'&&<p className="pair-feedback">Alice observed <strong>{BASIS_LABELS[basisA][aRecord!.outcome]}</strong>. Bob's sphere now shows the conditional state predicted when Alice's result is known. Test what Bob will see.</p>}
        {stage==='both'&&<p className="pair-feedback">This pair produced <strong>{currentJoint}</strong>. Repeat with a fresh pair; a single run does not reveal a probability distribution.</p>}
        {stage==='ready'&&<p className="pair-footnote">The two spheres show each qubit's local state. In entanglement, neither sphere alone captures the full pair.</p>}
      </section>

      <section className="pair-panel">
        <div className="pair-section-title"><span className="pair-step">3b</span><div><h3>Measure many fresh pairs</h3><p>Every trial prepares a new pair in the selected state. Compare the observed outcomes with predictions.</p></div></div>
        <div className="pair-batch-controls">
          <label htmlFor="pair-shots">Pairs</label><select id="pair-shots" value={shotCount} onChange={e=>setShotCount(Number(e.target.value) as 10|100|1000)}>
            <option value={10}>10</option><option value={100}>100</option><option value={1000}>1000</option>
          </select><button className="pair-primary" onClick={runBatch}>Run experiment</button>
        </div>
        <div className="pair-histogram">
          {OUTCOMES.map((outcome,i)=>{
            const p= batch ? batch.probabilities[i] : ideal[i]
            const observed=batch?batch.outcomes[i]/batch.count:0
            const label=batch?outcomeLabel(outcome,batch.aliceBasis,batch.bobBasis):outcomeLabel(outcome,basisA,basisB)
            return <div className="pair-hist-row" key={i}>
              <strong>{label}</strong>
              <div className="pair-hist-track">
                {batch&&<div className="pair-hist-fill" style={{width:(100*observed)+'%'}}/>}
                <span className="pair-hist-marker" style={{left:(100*p)+'%'}}/>
              </div>
              <span>{batch?batch.outcomes[i]+' ('+(100*observed).toFixed(0)+'%)':'—'}</span>
            </div>
          })}
        </div>
        <div className="pair-legend"><span className="pair-key observed"/> Sample frequency <span className="pair-key predicted"/> Ideal prediction</div>
        {batch ? <p className="pair-feedback" role="status">Measured {batch.count} fresh pairs. The same result on both sides occurred in {fmt((batch.outcomes[0]+batch.outcomes[3])/batch.count)} of trials. Repeat to observe sample variation.</p>:
          <p className="pair-footnote">Prediction markers show the ideal probabilities. Run the experiment to see a sampled histogram.</p>}
      </section>
    </div>

    <section className="pair-panel evidence-panel">
      <div className="pair-section-title"><span className="pair-step">4</span><div><h3>Compare correlations in two bases</h3><p>Measure fresh pairs with Z/Z, then with X/X. Keep the preparation the same and compare the results.</p></div></div>
      <div className="correlation-grid">
        <div><span>Z/Z: matching outcomes</span><strong>{evidence.zz?fmt(evidence.zz.same):'Not measured'}</strong><small>Ideal: {fmt((1+theoreticalZZ)/2)}</small></div>
        <div><span>X/X: matching outcomes</span><strong>{evidence.xx?fmt(evidence.xx.same):'Not measured'}</strong><small>Ideal: {fmt((1+theoreticalXX)/2)}</small></div>
      </div>
      <p className="pair-footnote">For the classical 00/11 mixture and Bell Φ+, Z/Z results agree. Only Bell Φ+ also gives perfect agreement in X/X. Bell Φ− instead gives opposite X/X results, demonstrating that the relative phase matters.</p>
      {hasBoth&&<div className="correlation-score" role="status">
        <strong>Two-basis correlation score: {experimentalScore!.toFixed(2)}</strong>
        <span>Compare with the ideal score {theoreticalScore.toFixed(2)} for this preparation. For a separable two-qubit state, the ideal score ⟨ZZ⟩ + ⟨XX⟩ cannot exceed 1; Bell Φ+ gives 2.</span>
        <small>Finite samples fluctuate: a measured score above 1 alone does not establish statistically significant entanglement. This is an introductory entanglement witness, not a Bell inequality test. It does not detect every Bell state.</small>
      </div>}
      <button className="teacher-toggle" onClick={()=>setShowTeacher(v=>!v)} aria-expanded={showTeacher}>{showTeacher?'Hide':'Show'} deeper physics</button>
      {showTeacher&&<div className="deeper-physics">
        <p>Two qubits have a joint 4×4 density matrix. The individual Bloch spheres are calculated by taking partial traces. For Φ+, both reduced states are I/2, so each sphere shows a centre dot. Nevertheless, Z/Z and X/X joint measurements are perfectly correlated.</p>
        <p>For any separable pair, the expectation ⟨Z⊗Z⟩ + ⟨X⊗X⟩ ≤ 1. This is a genuine two-basis entanglement witness under trusted qubit measurements. The Bell state Φ+ gives 2, while the simple 00/11 classical mixture gives 1. A finite experimental sample needs uncertainty analysis before drawing a formal conclusion. Bell Φ− can instead be witnessed by ⟨ZZ⟩ − ⟨XX⟩.</p>
        <p>Locally observed outcomes cannot be used to transmit information instantaneously. Bob's marginal statistics stay 50/50 unless Alice's outcome is communicated through an ordinary classical channel.</p>
      </div>}
    </section>
    <p className="pair-disclaimer">All experiments are ideal browser simulations, not live experiments on NQCT hardware. Measurement updates represent conditional quantum states, not physical signals between the two laboratories.</p>
  </section>
}
