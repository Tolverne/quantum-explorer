import { useState } from 'react'
import Sphere from '../visualization/Sphere'
import { BASIS_LABELS, type MeasurementBasis } from '../quantum/measurement'
import { mixtureVector,mixedProbabilities,mixedPurity,runMixedShots,type MixtureAxis,type MixedShotCounts } from '../quantum/mixed'

const NO_AXIS=[] as const
const noop=()=>{}
const presets=[
  {label:'All |0⟩',axis:'z' as const,weight:100},
  {label:'80% |0⟩ / 20% |1⟩',axis:'z' as const,weight:80},
  {label:'50% |0⟩ / 50% |1⟩',axis:'z' as const,weight:50},
  {label:'All |+⟩',axis:'x' as const,weight:100},
  {label:'50% |+⟩ / 50% |−⟩',axis:'x' as const,weight:50}
]
export default function MixedStateLab(){
  const [axis,setAxis]=useState<MixtureAxis>('z')
  const [weight,setWeight]=useState(80)
  const [basis,setBasis]=useState<MeasurementBasis>('z')
  const [count,setCount]=useState<10|100|1000>(100)
  const [result,setResult]=useState<MixedShotCounts|null>(null)
  const [lock,setLock]=useState(false)
  const vector=mixtureVector(axis,weight/100)
  const length=Math.hypot(...vector)
  const probabilities=mixedProbabilities(vector,basis)
  const name=axis==='z'?['|0⟩','|1⟩']:['|+⟩','|−⟩']
  function change(nextAxis:MixtureAxis,nextWeight:number){
    setAxis(nextAxis)
    setWeight(nextWeight)
    setResult(null)
  }
  function changeBasis(next:MeasurementBasis){setBasis(next);setResult(null)}
  return <section className="mixed-lab" aria-label="Mixed State Laboratory">
    <section className="mixed-intro">
      <span className="overline">LESSON 03 · MIXED QUANTUM STATES</span>
      <h2>What if we don't know which state was prepared?</h2>
      <p>Imagine a machine randomly prepares one of two opposite qubit states. The <strong>ensemble</strong> is described by a shorter Bloch vector. The centre represents a completely mixed state: outcomes are 50/50 in <em>every</em> measurement basis.</p>
      <div className="mixed-important">A shorter vector describes <strong>our preparation ensemble</strong>, not a single pure state whose arrow failed to reach the surface. An individual qubit produced by this source is still prepared in one of the two specified states.</div>
    </section>
    <div className="mixed-layout">
      <section className="mixed-sphere-card">
        <div className="panel-heading"><div><h2>Inside the Bloch sphere</h2><span className="tip">{lock?'View locked':'Drag empty space to orbit'}</span></div>
          <label className="lock"><input type="checkbox" checked={lock} onChange={e=>setLock(e.target.checked)}/> Lock camera</label></div>
        <div className="sphere"><Sphere state={vector} heldAxis={null} locked={lock} busy={false} axesDisabled allowedAxes={NO_AXIS} onStartHold={noop} onEndHold={noop}/></div>
        <div className="mixed-radius"><span>Bloch-vector length</span><strong>{length.toFixed(2)} / 1.00</strong><div className="mixed-radius-track"><div style={{width:(length*100)+'%'}}/></div>
          <p>{length<0.00001?'At the centre: maximally mixed.':length>0.99999?'On the surface: a pure state.':'Inside the sphere: a partially mixed state.'}</p></div>
      </section>
      <div className="mixed-controls">
        <section className="mixed-card">
          <h3><span className="pair-step">1</span> Choose the preparation mixture</h3>
          <p>A source prepares <strong>{name[0]}</strong> with probability {weight}%, or <strong>{name[1]}</strong> with probability {100-weight}%.</p>
          <div className="mixed-axis-tabs" role="group" aria-label="Pair of possible preparations">
            <button aria-pressed={axis==='z'} className={axis==='z'?'selected':''} onClick={()=>change('z',weight)}>Mix |0⟩ / |1⟩</button>
            <button aria-pressed={axis==='x'} className={axis==='x'?'selected':''} onClick={()=>change('x',weight)}>Mix |+⟩ / |−⟩</button>
          </div>
          <label className="mixed-slider-label" htmlFor="mixture-weight">Probability of {name[0]} <strong>{weight}%</strong></label>
          <input id="mixture-weight" type="range" min="0" max="100" step="5" value={weight} onChange={e=>change(axis,Number(e.target.value))}/>
          <div className="mixed-slider-hints"><span>Always {name[1]}</span><span>50/50</span><span>Always {name[0]}</span></div>
          <p className="mixed-presets-label">Try a prepared example</p>
          <div className="mixed-presets">{presets.map(p=><button key={p.label} onClick={()=>change(p.axis,p.weight)}>{p.label}</button>)}</div>
        </section>
        <section className="mixed-card">
          <h3><span className="pair-step">2</span> Choose what to measure</h3>
          <div className="mixed-axis-tabs" role="group" aria-label="Measurement basis">
            <button className={basis==='z'?'selected':''} aria-pressed={basis==='z'} onClick={()=>changeBasis('z')}>Z: 0 / 1</button>
            <button className={basis==='x'?'selected':''} aria-pressed={basis==='x'} onClick={()=>changeBasis('x')}>X: + / −</button>
          </div>
          <p>Ideal measurement probabilities for freshly prepared qubits from this source:</p>
          <div className="mixed-probabilities">
            {([0,1] as const).map(i=><div className="mixed-prob-row" key={i}>
              <span>{BASIS_LABELS[basis][i]}</span>
              <div><div style={{width:(100*probabilities[i])+'%'}}/></div>
              <strong>{(100*probabilities[i]).toFixed(0)}%</strong>
            </div>)}
          </div>
        </section>
      </div>
    </div>
    <section className="mixed-card mixed-experiment">
      <h3><span className="pair-step">3</span> Sample many freshly prepared qubits</h3>
      <p>Every trial draws a new state from the preparation mixture and measures it. Observe statistical variation and compare with the theoretical probabilities above.</p>
      <div className="mixed-run"><label htmlFor="mixed-shots">Trials</label>
        <select id="mixed-shots" value={count} onChange={e=>setCount(Number(e.target.value) as 10|100|1000)}>
          <option value="10">10</option><option value="100">100</option><option value="1000">1000</option>
        </select>
        <button onClick={()=>setResult(runMixedShots(vector,basis,count))}>Run experiment</button>
      </div>
      {result&&<div role="status" className="mixed-results">
        {([0,1] as const).map(i=><div key={i}><strong>{BASIS_LABELS[result.basis][i]}</strong><div className="mixed-count-track"><div style={{width:(result.counts[i]/result.total*100)+'%'}}/></div><span>{result.counts[i]} / {result.total}</span></div>)}
        <p>Compare these frequencies with the predicted probabilities. Try another batch, or change the measuring basis while the vector is at the centre.</p>
      </div>}
    </section>
    <section className="mixed-card mixed-takeaway">
      <h3>Why this matters before entanglement</h3>
      <p>A <strong>pure state</strong> is represented by a vector on the surface, and there is always at least one measurement axis along which the result is certain. In a <strong>partially mixed state</strong>, the vector is shorter. Along its own direction measurements can still be biased, but not completely certain. At the centre (maximally mixed), every axis is 50/50.</p>
      <p>In the next lesson, each part of a Bell pair will have a reduced Bloch vector at the centre. That alone does <strong>not</strong> prove entanglement: a classical random mixture can have the same local appearance. To see the difference, we must compare <em>joint correlations</em> between Alice and Bob in more than one basis.</p>
      <p className="mixed-extension">Optional extension: for a qubit with Bloch vector length |r|, its purity is (1 + |r|²)/2 = <strong>{mixedPurity(vector).toFixed(3)}</strong>. The purity lies between 0.5 (maximally mixed) and 1 (pure).</p>
    </section>
  </section>
}
