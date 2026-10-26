import type { LessonId } from './lessons'

export type Background = {
  introduction: string
  sections: readonly { heading:string; paragraphs: readonly string[] }[]
  discussion: readonly string[]
}

/** Self-contained lesson explanations for teachers and curious students. */
export const BACKGROUNDS: Record<LessonId,Background> = {
  qubits:{
    introduction:'A quantum bit, or qubit, is the basic unit used to store and process quantum information. This lesson builds a useful geometric picture: the Bloch sphere. Begin with the familiar idea of a classical bit that can have the value 0 or 1, then introduce what a state means in a quantum system.',
    sections:[
      {heading:'From bits to qubits',paragraphs:[
        'For a classical bit we can always read either 0 or 1. A qubit also gives one of two results when measured in the standard Z basis, but its state before measurement can be any pure superposition α|0⟩ + β|1⟩. The two complex amplitudes describe possible measurement results. Their squared magnitudes, |α|² and |β|², add to 1 and give the probabilities of 0 and 1. Students do not need complex arithmetic yet; the Bloch sphere will make the important distinctions visible.',
        'The north pole represents |0⟩ and the south pole represents |1⟩. Every point on the SURFACE represents another pure qubit state (after ignoring an unobservable global phase). For example, +X represents |+⟩ = (|0⟩ + |1⟩)/√2. This state does not mean the qubit is secretly a classical half-0, half-1 object. It has different measurement properties: Z is random, while an X measurement yields + with certainty.'
      ]},
      {heading:'Gates rotate the state, not the camera',paragraphs:[
        'In the explorer, X, Y and Z label three mutually perpendicular rotation axes. A +90° pulse is a quarter-turn, and a 180° pulse is a half-turn. Starting from +Z, X(+180°) reaches −Z, while Y(+90°) reaches +X. A positive angle follows the right-hand rule. Rotating the camera changes only the view, not the prepared quantum state; the lock-camera switch helps make this clear.',
        'Rotations depend on the state from which you start. X(+90°) on +Z gives −Y, but the same pulse from a different start point ends elsewhere. Rotations about two different axes generally do not commute: applying Y and then Z need not give the same result as Z and then Y. These pulse sequences foreshadow the ordered gates of a real quantum circuit.'
      ]},
      {heading:'Why some rotations appear to do nothing',paragraphs:[
        'A Bloch vector already aligned with its rotation axis keeps pointing in the same direction. Z(+90°) applied to |0⟩ therefore does not visibly change the state. Quantum mechanically this operation can change a global phase, but an overall global phase cannot be detected by measurements of that qubit alone. The same Z rotation applied after creating |+⟩ moves the equatorial vector and changes a relative phase, which does affect future measurement outcomes.',
        'Use missions 1–10 for practice. Students should predict the endpoint before applying a pulse, describe their sequence with axis and angle, and explain their reasoning. There may be several correct routes. A 10° target tolerance makes press-and-hold control accessible without changing the underlying physics.'
      ]}
    ],
    discussion:[
      'Ask: how can two states give identical Z measurement statistics yet differ in X?',
      'Check that students distinguish physical gates from camera movement and see why gate order can matter.',
      'Bridge to the next lesson: the surface arrow represents a prepared state, but what will one measurement actually show?'
    ]
  },
  measurement:{
    introduction:'A state and a measurement outcome are different things. This lesson begins with a known pure state, asks what can be predicted, and then compares a single result with the statistics of many separate trials. No special mathematical background is needed beyond probability.',
    sections:[
      {heading:'Preparation, basis and probabilities',paragraphs:[
        'To prepare a state is to set up the physical system so repeated runs begin in the same quantum state. The north pole |0⟩ always produces 0 when measured in Z; the south pole |1⟩ always produces 1 in Z. These are Z-basis eigenstates. A basis describes which pair of alternatives the measuring device can distinguish. For Z the outcomes are 0 and 1; for X they are + and −.',
        'Prepare |+⟩ on the +X equator. A Z measurement now gives 0 or 1 with equal probability, while an X measurement gives + with certainty. Thus a known pure state need not produce a predictable result in every basis. A 50/50 distribution does not imply that the student prepared the state incorrectly.'
      ]},
      {heading:'A single outcome versus a distribution',paragraphs:[
        'An individual ideal measurement has exactly one result. The app samples this result according to the Born rule. For a pure state represented by a unit Bloch vector r and a measurement along a unit axis n, the probability of the positive outcome is (1 + r·n)/2. The opposite outcome has the remaining probability. Students can read this visually as how strongly the arrow points along the measuring axis.',
        'A trial with 100 freshly prepared |+⟩ qubits measured in Z should produce ABOUT 50 zeroes and 50 ones, not necessarily exactly 50 of each. Increase from 10 to 100 to 1,000 trials and compare sample frequencies with the ideal prediction. The simulator re-prepares the original state for every batch trial; this is essential for interpreting the histogram.'
      ]},
      {heading:'What happens after measurement?',paragraphs:[
        'In the ideal projective model, measurement updates the state to an eigenstate of the measured observable. If Z measurement of |+⟩ yields 1, the live qubit becomes |1⟩. An immediate second Z measurement of that SAME qubit must give 1 again. But pressing “Prepare again” creates a fresh |+⟩ state, so its next Z result is again 50/50. These are two different experiments.',
        'If the student changes the basis between consecutive measurements, the results may be unpredictable again. For example, after collapsing to |0⟩ in Z, measuring in X gives + or − with equal probability. This provides a gentle way to discuss incompatible measurements. Our simulator models the probabilities and state update accurately for ideal qubits but does not settle philosophical interpretations of why a particular outcome occurs.'
      ]}
    ],
    discussion:[
      'Distinguish “a 50% chance” from a measurement showing the value 0 or 1.',
      'Ask students to justify why same-qubit repeats and many fresh preparations produce different sequences.',
      'Bridge to mixed states: a pure |+⟩ can look random in Z; is that the same as a source that randomly prepares different states?'
    ]
  },
  mixed:{
    introduction:'This lesson introduces mixed quantum states before considering entanglement. Students already know that a pure qubit can give uncertain results in one measurement basis. Now ask a different question: what if the preparation device itself randomly makes different pure states, and we do not know which state was selected on a particular trial?',
    sections:[
      {heading:'A mixed state is an ensemble description',paragraphs:[
        'Suppose a machine prepares |0⟩ in 80% of runs and |1⟩ in 20%. Every individual run begins in one of these two pure states, but the collection is described by a statistical mixture. Its density matrix is ρ = 0.8|0⟩⟨0| + 0.2|1⟩⟨1|. For Year 10, this formula can simply mean “80% of one preparation and 20% of the other”. A mixed state is not a single qubit simultaneously sitting partway between two pure states.',
        'The Bloch sphere can show mixed states as points INSIDE the sphere. The mixture above has vector r = (0,0,0.6), 60% of the distance from the centre to the north pole. In Z the results are 80% zero and 20% one; in X they remain 50/50. Because the vector does not extend to the surface, there is no axis whose ideal measurement result is completely certain.'
      ]},
      {heading:'The meaning of the centre',paragraphs:[
        'Slide the preparation to an equal 50/50 mixture of |0⟩ and |1⟩. The vector reaches the exact centre, r = 0. This is the maximally mixed state ρ = I/2. It produces 50/50 outcomes along Z, X, Y, or ANY direction. The centre is not a new possible result: every two-outcome measurement still produces one of its two results.',
        'Try a different source that prepares |+⟩ half the time and |−⟩ half the time. It also produces ρ = I/2. These are two different stories for preparing exactly the same mixed density matrix. No measurement on a single member of the ensemble can distinguish them solely from their equal statistical predictions.'
      ]},
      {heading:'Pure superposition is not the same as a mixture',paragraphs:[
        'It is important to contrast a pure |+⟩ state with the balanced mixture of |0⟩ and |1⟩. Both produce 50/50 outcomes in Z. But |+⟩ gives the X outcome + with certainty, whereas the balanced mixture gives 50/50 in X as well. Thus one randomly selected measurement basis alone can conceal meaningful differences between states. The point at +X on the SURFACE and the point at the CENTRE are not equivalent.',
        'The length |r| measures how mixed the state is: a pure state has |r| = 1, an intermediate mixture has 0 < |r| < 1, and maximal mixture has |r| = 0. An optional extension is the purity Tr(ρ²) = (1 + |r|²)/2, which ranges from 1 for pure states to 1/2 for the maximally mixed qubit. Shorter does not mean no knowledge of any measurement: only at the exact centre are ALL directions completely unbiased.'
      ]}
    ],
    discussion:[
      'Ask: what differs between a pure |+⟩ and an equal |0⟩/|1⟩ mixture even though Z statistics match?',
      'Ask: why does an 80/20 mixture still give useful predictive information in Z but not X?',
      'Bridge to entanglement: each qubit in a Bell pair appears maximally mixed locally; the difference lies in the JOINT pair state and its correlations.'
    ]
  },
  entanglement:{
    introduction:'Entanglement concerns the JOINT state of multiple quantum systems. Mixed states are the essential bridge: the individual qubits in a Bell pair can look completely random, while their joint results show correlations that ordinary independently random bits do not have. Start with familiar classical probability before showing the Bell-pair experiment.',
    sections:[
      {heading:'Three different classical or quantum starting points',paragraphs:[
        'First consider two independently random classical bits. Alice randomly gets 0 or 1, and Bob independently randomly gets 0 or 1. There are four equally likely combinations: 00, 01, 10 and 11. Each local bit is uncertain and the pair has no correlations. In the lab this is “Two random bits”.',
        'Next consider a classical machine that generates ONE fair random bit and copies it to Alice and Bob. Each individual bit still has a 50% chance of 0 or 1, but the only possible pairs are 00 and 11. Their Z outcomes always MATCH. This is a classical correlation, not an entangled state. Saying “either 00 or 11” does not mean each individual bit is fixed: each one is random, but they are linked by an ordinary copying rule.',
        'The lab also allows two independent pure |+⟩ states. They always match in X, even though they are not entangled. This is another reminder that identical outcomes alone are insufficient evidence.'
      ]},
      {heading:'What distinguishes a Bell pair?',paragraphs:[
        'For the entangled Bell state Φ+ = (|00⟩ + |11⟩)/√2, Z/Z measurements also give 00 or 11 with equal probabilities, just like the classical copied-bit mixture. A Z-only experiment therefore cannot distinguish the two sources. But when BOTH qubits are measured in the X basis, Φ+ produces only ++ or −−, again matching perfectly. The classical copied-bit mixture instead gives all four X/X outcomes equally often.',
        'The Bell pair is a coherent superposition of joint alternatives, not an ordinary 50/50 lottery selecting either a particular 00 pair or a particular 11 pair. In the simulator, H on Alice followed by a controlled NOT (CNOT) gate prepares Φ+ from 00. The Bell state Φ− = (|00⟩ − |11⟩)/√2 has the same Z/Z correlations but always gives OPPOSITE X/X results, showing that relative phase matters.'
      ]},
      {heading:'Why both Bloch spheres show a centre dot',paragraphs:[
        'Each qubit of Φ+ or Φ− has reduced density matrix I/2: viewed alone it is maximally mixed, just like each part of the two random classical sources. A Bloch sphere can display only that local reduced state, not the complete two-qubit state. The joint correlations are additional information. When Alice measures first and her result becomes known, the state assigned to Bob conditionally changes. Bob still cannot tell what Alice did, or what she saw, from his own measurements alone; a classical message is required to compare results.',
        'For extension students, the combination E_ZZ + E_XX of two correlation measurements is at most 1 for a separable two-qubit state under trusted measurements, while Φ+ gives 2. This is an entanglement witness, not a loophole-free Bell-inequality test. A small excess in finite-shot data needs uncertainty analysis, and other witnesses are needed for some entangled states.'
      ]}
    ],
    discussion:[
      'Have students compare the exact predicted ZZ and XX outcome tables for independent bits, copied bits and Bell Φ+.',
      'Ask why the local centre dots alone cannot diagnose entanglement.',
      'Connect the H–CNOT circuit and the idea of conditional correlations to the real five-qubit computer they will encounter during the excursion.'
    ]
  }
}
