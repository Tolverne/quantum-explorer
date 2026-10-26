export type LessonId='qubits'|'measurement'|'mixed'|'entanglement'
export type LabMode='explore'|'challenge'|'measurement'|'mixed'|'entanglement'
export type Activity={
 id:string;title:string;minutes:number;tool:LabMode;challengeIndex?:number;
 prediction:string;options:readonly [string,string,string];correct:number;
 experiment:string;explanation:string;reflection:string;teacherNote:string
}
export type Lesson={
 id:LessonId;number:number;title:string;subtitle:string;essentialQuestion:string;
 duration:string;outcomes:readonly string[];activities:readonly Activity[]
}
export const LESSONS:readonly Lesson[]=[
 {id:'qubits',number:1,title:'What is a qubit?',subtitle:'Rotations and quantum states',
 essentialQuestion:'How can we prepare a qubit in more than just two states?',duration:'60 minutes',
 outcomes:['Identify poles and axes of the Bloch sphere','Prepare an equatorial state using a quarter-turn','Predict how changing the axis or order of rotations affects a state'],
 activities:[
  {id:'q-flip',title:'A quantum bit flip',minutes:12,tool:'explore',
  prediction:'Starting at |0⟩, what will X(+180°) do?',
  options:['Move to |1⟩','Remain at |0⟩','Move to +X'],correct:0,
  experiment:'In Free Explorer, reset to |0⟩. Select X and pulse 180°. Replay the rotation, then move the camera without applying a pulse.',
  explanation:'A half-turn about X sends the north pole |0⟩ to the south pole |1⟩.',
  reflection:'How is rotating the qubit state different from moving the camera?',
  teacherNote:'Separate state change from viewpoint. Use camera lock to make the contrast visible.'},
  {id:'q-equator',title:'Beyond zero and one',minutes:12,tool:'explore',
  prediction:'Starting from |0⟩, where does Y(+90°) take the arrow?',
  options:['The south pole','The +X equator','It stays at +Z'],correct:1,
  experiment:'Reset and apply Y(+90°). Follow this by a Z rotation while the arrow is on the equator.',
  explanation:'Y(+90°) prepares |+⟩, a superposition represented by a point on the equator.',
  reflection:'What new kind of state does the Bloch sphere allow, beyond the two poles?',
  teacherNote:'A superposition is not a physical arrow literally spinning or a classical blend of bits.'},
  {id:'q-axis',title:'A rotation with no visible change',minutes:10,tool:'explore',
  prediction:'From |0⟩ (along +Z), what does a Z(+90°) pulse visibly do?',
  options:['Move to +X','Move to |1⟩','Leave the arrow at +Z'],correct:2,
  experiment:'Reset, rotate around Z, then use Y(+90°) to reach +X and rotate around Z again.',
  explanation:'An axis-aligned Bloch vector remains in place when rotated about that axis. On the equator, a Z rotation changes the relative phase and the Bloch direction.',
  reflection:'Why does Z have a visible effect on an equatorial state but not on |0⟩?',
  teacherNote:'Introduce observable relative phase, but not complex amplitudes.'},
  {id:'q-route',title:'A two-pulse route',minutes:14,tool:'challenge',challengeIndex:4,
  prediction:'Do Y then Z and Z then Y always produce the same state?',
  options:['Yes, rotations always commute','No, order can affect the state','Only for negative angles'],correct:1,
  experiment:'Open Target Challenge 5 and find a Y/Z sequence that reaches +Y from |0⟩. Replay it. If ready, attempt Challenge 6.',
  explanation:'Rotations around different axes generally do not commute. An ordered pulse sequence prepares a particular quantum state.',
  reflection:'Record one successful ordered pulse sequence and explain why the order matters.',
  teacherNote:'Give students time to compare different routes; allow five minutes for a plenary.'},
  {id:'q-extra-challenges',title:'Four more ways through the sphere',minutes:12,tool:'challenge',challengeIndex:6,
  prediction:'Can the same 90° Y rotation move |1⟩ to −X, rather than +X?',
  options:['Yes—the result depends on the starting state','No—Y(+90°) always reaches +X','It depends only on the camera angle'],correct:0,
  experiment:'Try missions 7–10: south to −X, opposite equatorial states, a negative X quarter-turn, and a restricted X/Z two-pulse route. Choose any two to record in your journal.',
  explanation:'Rotations act on the state that is already prepared. The same gate can have different outcomes from different starting points, and a restricted gate set may require a sequence.',
  reflection:'Record two new missions, your ordered pulse sequences, and one thing you learned about start states, rotation direction or allowed axes.',
  teacherNote:'These extra challenges consolidate the right-hand rule, inverse quarter-turns and constrained pulse sequences. Accept different valid routes if they obey the permitted axes.'}
 ]},
 {id:'measurement',number:2,title:'What is measurement?',subtitle:'Preparation, randomness and observation',
 essentialQuestion:'How can a known quantum state produce unpredictable individual outcomes?',duration:'60 minutes',
 outcomes:['Distinguish state from observed outcome','Compare single repeated measurements with independent shots','Explain why measurement basis matters'],
 activities:[
  {id:'m-poles',title:'A predictable measurement',minutes:12,tool:'measurement',
  prediction:'Prepare |0⟩ and measure in Z. What will you see?',
  options:['Always 0','Always 1','A 50/50 mixture of 0 and 1'],correct:0,
  experiment:'Prepare |0⟩, measure in Z once, then run 100 fresh shots. Repeat for |1⟩.',
  explanation:'|0⟩ and |1⟩ are Z-measurement eigenstates, so their Z outcomes are certain.',
  reflection:'Why is this measurement predictable even though some quantum measurements are random?',
  teacherNote:'Predictions depend on the basis in which the state is measured.'},
  {id:'m-random',title:'Known state, uncertain result',minutes:14,tool:'measurement',
  prediction:'Measure a freshly prepared |+⟩ once in Z. What is predictable?',
  options:['Always 0','Always 1','Either 0 or 1 with equal probability'],correct:2,
  experiment:'Prepare |+⟩ and measure once in Z. Prepare it again for another single result, then run 10, 100 and 1,000 fresh shots.',
  explanation:'The state is known, yet one Z result is uncertain. The ideal distribution is 50% each; finite observed frequencies may differ.',
  reflection:'Explain the difference between an outcome and the probability of an outcome.',
  teacherNote:'Emphasise sampling variation as the number of fresh shots increases.'},
  {id:'m-repeat',title:'The same qubit, twice',minutes:14,tool:'measurement',
  prediction:'After a Z measurement gives 1, what will an immediate second Z measurement on that same qubit give?',
  options:['Always 0','Always 1 again','50/50 again'],correct:1,
  experiment:'Prepare |+⟩ and measure in Z. Without re-preparing, repeat the Z measurement. Compare with pressing Prepare again.',
  explanation:'An ideal projective measurement leaves the qubit in the observed eigenstate. Repeating the same basis immediately repeats the outcome; fresh preparation is different.',
  reflection:'Why are 100 repeated measurements of the same collapsed qubit unlike 100 fresh preparations?',
  teacherNote:'Whichever first outcome occurs repeats; the conditional question happens to specify 1.'},
  {id:'m-basis',title:'Change the measuring axis',minutes:15,tool:'measurement',
  prediction:'If |+⟩ is measured in X instead of Z, what happens?',
  options:['Always +','Always −','50/50 between + and −'],correct:0,
  experiment:'Prepare |+⟩ and compare 100 fresh measurements in Z and X. Then prepare |0⟩ and repeat.',
  explanation:'|+⟩ is an X eigenstate, while Z gives random outcomes. Quantum measurement probabilities depend on the chosen basis.',
  reflection:'Why must every measurement result specify its basis?',
  teacherNote:'Discuss what the probability model predicts without claiming to solve the interpretation of measurement.'}
 ]},

 {id:'mixed',number:3,title:'What is a mixed state?',subtitle:'Uncertain preparation and the inside of the sphere',
 essentialQuestion:'What does it mean when the Bloch vector gets shorter?',duration:'60 minutes',
 outcomes:['Distinguish pure states from statistical mixtures','Predict X/Z measurement outcomes from a mixed Bloch vector','Explain why the centre is completely unbiased in any basis'],
 activities:[
  {id:'mix-pure',title:'Pure states live on the surface',minutes:12,tool:'mixed',
  prediction:'If every run prepares |0⟩, where is the ensemble Bloch vector?',
  options:['At the north pole','At the centre','Halfway to the south pole'],correct:0,
  experiment:'Open Mixed State Lab. Choose “All |0⟩”. Look at vector length and compare outcomes in Z and X. Then choose “All |+⟩” and repeat.',
  explanation:'A pure state has Bloch-vector length 1 and sits on the sphere surface. |0⟩ is certain in Z but random in X; |+⟩ is certain in X but random in Z. Random outcomes in one basis do not imply a mixed state.',
  reflection:'Why does a 50/50 Z measurement for the pure state |+⟩ not mean the Bloch vector is at the centre?',
  teacherNote:'Compare the X and Z bases for both pure states. This addresses the common misconception that any random measurement implies a mixed state.'},
  {id:'mix-partial',title:'A source with an uncertain preparation',minutes:14,tool:'mixed',
  prediction:'A source sends |0⟩ 80% of the time and |1⟩ 20% of the time. What Z distribution do you expect?',
  options:['100% outcome 0','80% outcome 0 and 20% outcome 1','50% of each'],correct:1,
  experiment:'Set the mixture to 80% |0⟩. Observe a Bloch vector of length 0.6. Compare Z and X predictions; run 100 and 1,000 fresh samples.',
  explanation:'A mixture of opposite Z eigenstates has r = (0,0,2p−1). At p=0.8 the vector has length 0.6: Z is 80/20 but X remains 50/50.',
  reflection:'Explain why the vector is shorter and why the Z outcomes can still be biased.',
  teacherNote:'Be explicit that the source randomly selects a state on each run, rather than physically shrinking an individual pure qubit.'},
  {id:'mix-centre',title:'Reach the centre of the sphere',minutes:14,tool:'mixed',
  prediction:'At a 50/50 mixture of |0⟩ and |1⟩, what happens in both X and Z bases?',
  options:['Always 0 in Z','50/50 in Z but certain in X','50/50 in both bases'],correct:2,
  experiment:'Move the mixture slider to exactly 50%. The arrow disappears into a centre dot. Measure 100 and 1,000 fresh samples in Z and X.',
  explanation:'An equal mixture of orthogonal states has zero Bloch vector, represented by the centre. The reduced density matrix is I/2: any direction is unbiased (50/50 for a two-outcome spin measurement).',
  reflection:'What makes the centre fundamentally different from a pure state on the equator?',
  teacherNote:'The centre is not a third measured outcome; every individual measurement still gives one of two results. Sampling fluctuations are normal.'},
  {id:'mix-other-basis',title:'One centre, different mixtures',minutes:15,tool:'mixed',
  prediction:'Does a 50/50 mixture of |+⟩ and |−⟩ give the same state as a 50/50 mixture of |0⟩ and |1⟩?',
  options:['No, the spheres point in different directions','Yes, both are maximally mixed','Only when measured in Z'],correct:1,
  experiment:'Compare 50/50 Z mixtures with 50/50 X mixtures in the Mixed State Lab. Try an 80/20 X mixture too, noting which measurement basis becomes biased.',
  explanation:'Both balanced mixtures produce the same density matrix I/2, even though the preparation stories differ. Away from the centre, the axis and arrow length together determine which measurements are biased.',
  reflection:'Explain how a maximally mixed single-qubit state prepares us to understand a Bell pair’s local Bloch spheres.',
  teacherNote:'This connects statistical ensembles, basis dependence and reduced states. Prepare students for the surprising fact that an entangled pair also has locally mixed qubits.'}
 ]},
 {id:'entanglement',number:4,title:'What is entanglement?',subtitle:'Two qubits, one joint state',
 essentialQuestion:'What can a two-qubit state reveal that individual qubits cannot?',duration:'60 minutes',
 outcomes:['Interpret four joint measurement results','Explain why one-basis correlations do not establish entanglement','Compare Bell pairs with a classical mixture using two bases'],
 activities:[
  {id:'e-independent',title:'Two independent qubits',minutes:12,tool:'entanglement',
  prediction:'Two separate |+⟩ qubits measured in Z/Z produce what distribution?',
  options:['Only 00 and 11','All four outcomes equally likely','Only 01 and 10'],correct:1,
  experiment:'Select Independent, use Z/Z and run 100 pairs. Switch to X/X and repeat.',
  explanation:'Two independent |+⟩ states each give random Z results, so joint outcomes have probability 25% each. In X/X, both give + with certainty.',
  reflection:'Why does obtaining ++ every time in X/X not prove entanglement?',
  teacherNote:'Distinguish independence from matching fixed values.'},
  {id:'e-random',title:'Two independently random bits',minutes:10,tool:'entanglement',
  prediction:'Alice and Bob each choose a fair classical bit independently. How often will their bits match?',
  options:['Always','Half the time','Never'],correct:1,
  experiment:'Select “Two random bits”. Each bit independently takes 0 or 1. Run 100 fresh pairs in Z/Z, then X/X; look for 00, 01, 10 and 11.',
  explanation:'Independent random bits give the four pairs 00, 01, 10 and 11 with equal probability. Each single bit is locally maximally mixed, but there is no pair correlation in either Z or X.',
  reflection:'How is this preparation different from copying one random bit to make 00 or 11?',
  teacherNote:'Use this to separate randomness from correlation: individually random does not mean two bits are linked.'},
  {id:'e-classical',title:'The classical explanation',minutes:12,tool:'entanglement',
  prediction:'A source randomly prepares 00 or 11. What happens in Z/Z?',
  options:['They always match','They always differ','Four equal combinations'],correct:0,
  experiment:'Choose Classically matched bits: Alice and Bob each could be 0 or 1, but the source COPIES the same random bit to both. Run Z/Z and X/X and compare with Two random bits.',
  explanation:'Each local bit is random, but because one random classical bit is copied to both destinations, only 00 or 11 occur and Z outcomes always match. In X the results are uncorrelated. Local randomness and one-basis matching still do not prove entanglement.',
  reflection:'Which extra measurement would help distinguish this classical source from a Bell pair?',
  teacherNote:'This state is a genuine mixed density matrix, not a coherent superposition.'},
  {id:'e-bell',title:'The Bell-pair mystery',minutes:13,tool:'entanglement',
  prediction:'Bell Φ+ matches in Z/Z. What happens in X/X?',
  options:['Only ++ and −−, equally likely','Four equally likely outcomes','Only +− and −+'],correct:0,
  experiment:'Choose Bell Φ+ and measure 100–1,000 pairs in Z/Z and X/X. Measure Alice first on one pair and inspect Bob’s conditional state.',
  explanation:'Bell Φ+ correlates in both bases, although each individual reduced qubit is maximally mixed (a dot at the sphere centre).',
  reflection:'How can each qubit look individually random while their joint measurements still agree?',
  teacherNote:'Conditional state updates do not allow faster-than-light communication.'},
  {id:'e-phase',title:'An opposite correlation',minutes:10,tool:'entanglement',
  prediction:'Bell Φ− matches in Z/Z. How do its X/X measurements behave?',
  options:['They match','They always disagree','Four combinations equally'],correct:1,
  experiment:'Choose Bell Φ−, run 100 fresh pairs in Z/Z then X/X, and compare to Bell Φ+.',
  explanation:'Bell Φ− has matching Z results but opposite X results; relative phase changes the cross-basis correlations.',
  reflection:'How did two measurement bases distinguish a classically correlated pair from entanglement?',
  teacherNote:'The two-basis comparison motivates an entanglement witness, not a full Bell test.'}
 ]}
]
export type StudentEntry={prediction?:number;observation?:string;reflection?:string;completed?:boolean}
export function completedCount(lesson:Lesson,entries:Readonly<Record<string,StudentEntry>>):number{
 return lesson.activities.filter(a=>entries[a.id]?.completed===true).length
}
export function progressPercent(lesson:Lesson,entries:Readonly<Record<string,StudentEntry>>):number{
 return Math.round(100*completedCount(lesson,entries)/lesson.activities.length)
}
export function canComplete(entry:StudentEntry|undefined):boolean{
 return entry?.prediction!==undefined&&Boolean(entry.observation?.trim())&&Boolean(entry.reflection?.trim())
}
export function allActivityIds():string[]{return LESSONS.flatMap(l=>l.activities.map(a=>a.id))}
export function courseSummary(entries:Readonly<Record<string,StudentEntry>>):string{
 return [
  '# Quantum Explorer — Student investigation journal',
  'No name or student account required. Save this to your own device.',
  ...LESSONS.flatMap(l=>[
   '',
   '## Lesson '+l.number+': '+l.title,
   'Essential question: '+l.essentialQuestion,
   ...l.activities.flatMap(a=>{
    const e=entries[a.id]||{}
    return [
     '',
     '### '+a.title+(e.completed?' — completed':' — in progress'),
     'Prediction question: '+a.prediction,
     'Prediction: '+(e.prediction===undefined?'Not recorded':a.options[e.prediction]),
     'Experiment: '+a.experiment,
     'Observation: '+(e.observation?.trim()||'Not recorded'),
     'Reflection question: '+a.reflection,
     'Reflection: '+(e.reflection?.trim()||'Not recorded')
    ]
   })
  ])
 ].join('\n')
}
