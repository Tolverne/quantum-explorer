# Quantum Explorer M4 — Lesson 3: What is entanglement?

**Audience:** high-achieving Year 10 mathematics/science students preparing for Year 11 Physics and an excursion to the UQ National Quantum Computing Testbed.

**Suggested duration:** approximately 60 minutes, ideally after the new mixed-state lesson. M4 is an **ideal simulator** with no student accounts, tracking or connection to real quantum hardware.

## Learning intentions
Students should be able to:
- distinguish outcomes of measurements on a *single* qubit from **joint** outcomes on two qubits;
- explain what the four two-qubit outcomes 00, 01, 10 and 11 mean;
- compare independent qubits, classically correlated pairs and Bell pairs;
- discover that a qubit can be locally maximally mixed (Bloch vector at the centre) while its pair has perfectly predictable correlations in suitable bases;
- understand that Bell Φ+ can give correlated results when both qubits are measured in either Z or X, unlike the 00/11 classical mixture;
- connect the Bell-pair preparation to the circuit H(A) followed by CNOT(A→B).

**Start by distinguishing two types of classical sources:** (a) two independently random bits, which produce 00,01,10,11 equally, and (b) a single random bit copied to both students, producing only 00 or 11. Each local bit is random in both cases, but only the second has classical Z/Z correlations. Neither is entangled.

## Suggested student investigations

**Part 1 — Independent qubits (5–10 minutes).** Select “Independent”. Both are prepared as |+⟩. Predict the XX histogram, then the ZZ histogram. Record whether the results match more often than random chance. Note that the probability of agreeing is 100% in XX when both |+⟩ states are measured, but this alone is *not entanglement*.

**Part 2 — Classical correlations (10 minutes).** Select “Classical pair”. The source randomly prepares 00 or 11. Measure ZZ for 100+ fresh pairs. Notice only 00 and 11 outcomes. Now select XX and repeat: all four combinations appear. The source was classically correlated, but those Z-basis matches did not imply entanglement.

**Part 3 — Entangled Bell Φ+ (15 minutes).** Select Bell Φ+. In ZZ, 00 and 11 are equally likely and results always agree. Switch both to X; **++ and −−** are equally likely and results always agree again. Notice the two *local* Bloch vectors are at the sphere centres before measurement. Each local qubit is individually random: the correlations reside in the two-qubit state.

**Part 4 — Alice first, then Bob (10 minutes).** Prepare a fresh Bell pair, choose ZZ, measure Alice and inspect Bob's conditional Bloch sphere. Then measure Bob. Repeat with XX. Compare with the classical pair measured in X: when Alice sees +, Bob still has a locally mixed state, so no perfect X correlation follows. Importantly, Bob cannot infer Alice's outcome without an ordinary classical message from Alice.

**Part 5 — Relative phase (5–10 minutes).** Select Bell Φ−. ZZ outcomes agree just as for Φ+. XX outcomes are now always opposite (+− or −+). Changing a relative phase alters observable two-qubit correlations despite leaving the individual qubits locally random.

**Reflection (5 minutes).** What can we infer from a single pair? From 10 pairs? From 1,000? Why do we need measurements in more than one basis to distinguish the classical mixture from Bell Φ+?

## Reference predictions

Here each pair is measured with both detectors in the indicated basis.

| Prepared pair | ZZ outcomes | XX outcomes | Correlation E_ZZ | Correlation E_XX |
|---|---|---|---:|---:|
| Independent (+X,+X) | 00/01/10/11 equally likely | ++ always | 0 | +1 |
| Classical 00/11 mixture | 00 or 11, each 50% | ++/+−/−+/−− equally likely | +1 | 0 |
| Bell Φ+ = (00+11)/√2 | 00 or 11, each 50% | ++ or −−, each 50% | +1 | +1 |
| Bell Φ− = (00−11)/√2 | 00 or 11, each 50% | +− or −+, each 50% | +1 | −1 |

For mixed measurement bases ZX and XZ, each of the four outcomes has 25% probability for Bell Φ+ and Φ−. Both local results remain random.

## An optional advanced concept: a real entanglement witness

For an outcome pair a,b encoded as ±1, E = P(same) − P(different).

Consider W = E_ZZ + E_XX.

For any **separable** two-qubit state, W ≤ 1 (assuming correct qubit measurements). For a product state with Bloch vectors r and s, W = r_z s_z + r_x s_x ≤ |r||s| ≤ 1 by Cauchy–Schwarz; any convex mixture of product states also satisfies the bound. Bell Φ+ gives W = 2. The classical correlated 00/11 mixture and independent |++⟩ give W = 1.

This is a genuine *entanglement witness*, **not a Bell-inequality experiment**. Finite sampling noise means that a measured W slightly above 1 is not, by itself, statistically significant. A witness may also fail to detect some entangled states: Bell Φ− has W = 0, but the alternative W− = E_ZZ − E_XX gives 2 for Φ−.

For Year 10, this may be explained visually as "Bell Φ+ is correlated across both incompatible measurement choices", reserving the inequality for extension students and the teacher guide.

## Notes about the visual representation
A single Bloch sphere shows a *reduced state*. Entangled Bell Φ+ and Φ− have maximally mixed individual reduced density matrices (I/2): on each sphere the marker sits at the centre, not on the surface. When Alice measures her qubit and her result is known, the conditional Bob state becomes pure in the measurement basis. This depicts a change in **conditional predictions**, not an instantaneous usable signal.

## Physics implementation and scope
M4 represents two-qubit preparations as **4×4 density matrices**. The classical correlated state is a genuine mixed density matrix. Bell states are prepared using H and CNOT transformations (and Z for Φ−). Joint probabilities and sequential projective measurements are calculated with X/Z projectors; the marginal Bloch vectors are calculated by partial traces.

This first two-qubit version supports real-amplitude states and X/Z measurements. A future Y-basis and general phase-gate simulator requires complex density matrices. The app currently omits hardware noise, leakage, decoherence, imperfect readout and experimental uncertainty analysis.

No student account or personal identifier is required, and no student answers are transmitted to a server. Guided responses and challenge completion are stored in local browser IndexedDB when allowed; teachers should remind students to clear work on shared computers and export the Markdown journal for submission. All simulated shots are generated in the browser. There is no live hardware integration, login or server-side tracking of students.
