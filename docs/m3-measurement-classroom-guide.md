# Quantum Explorer M3 — Lesson 2: What is a quantum measurement?

**Audience:** high-achieving Year 10 students preparing for Year 11 Physics and a National Quantum Computing Testbed visit. **Time:** about 50–60 minutes.

## Core distinction
- A **prepared quantum state** determines measurement probabilities.
- A **single measurement** yields *one observed result*, not a probability distribution.
- An ideal projective measurement changes the measured qubit's state to the eigenstate associated with its result.
- Repeating a measurement **on the same qubit, immediately in the same basis**, gives the same answer.
- By contrast, a histogram of many shots is built by **preparing the original state anew for each shot**.

The app deliberately offers two separate experiments side by side to make this distinction clear. Neither calls the UQ hardware; this is an ideal browser simulation.

## Suggested classroom sequence

**0–8 min — Recall preparation:** In Measurement Lab, choose the |0⟩ preset. Ask students where the Bloch vector points and predict what a Z-basis measurement will show. Measure once and immediately measure *the same qubit* again. Compare with the |1⟩ preset.

**8–20 min — Superposition and uncertainty:** Choose the |+⟩ preset, made from |0⟩ by Y(+90°). Ask students to predict a Z measurement. Observe a single 0 or 1 result, then notice how the arrow moves to the pole corresponding to the observation. Re-measure without re-preparing, with the basis unchanged. Ask why the answer now repeats.

**20–35 min — Repeated trials:** Press **Prepare again**, run a batch of 10 trials in Z and compare measured bars with the predicted 50/50 markers. Run 100 and 1,000 trials. The app re-prepares |+⟩ for *every shot*, so these results need not match the repeated-measurement sequence on one collapsed qubit. The predictions are exact for the ideal model; the observed bars fluctuate.

**35–45 min — Basis matters:** Prepare |+⟩ again. Change the detector from Z to X *without* changing the state. The X-basis result is deterministically '+'. Now prepare |0⟩ and measure in X: the distribution is 50/50. Discuss why a measurement is always relative to a chosen basis.

**45–60 min — Inquiry:** Students prepare their own intermediate state using 45° or other arbitrary holds, predict a change in histogram, and test it. Try single measurements across different bases: measure Z first, then measure X on the same qubit. Optionally consider the deeper "measurement problem": the model predicts observed outcomes and state updates but does not explain why a particular outcome occurs on one run.

## Teacher reference: expected ideal results

| Preparation | Z measurement (0,1) | X measurement (+,−) |
|---|---|---|
| |0⟩ | (100%, 0%) | (50%, 50%) |
| |1⟩ | (0%, 100%) | (50%, 50%) |
| |+⟩ | (50%, 50%) | (100%, 0%) |
| |−⟩ | (50%, 50%) | (0%, 100%) |

For any pure Bloch vector **r**, with measurement along the unit axis **n**, the model uses the Born rule in Bloch form:

- Probability of outcome **+n**: **(1 + r · n)/2**
- Probability of outcome **−n**: **(1 − r · n)/2**

The '0/1' labels refer to the Z basis; the '+/−' labels refer to X. The result displayed in the single-shot card retains its original basis label even if the basis control is later changed.

### Important conceptual checks
1. Does a vector on the equator mean that a measurement is always random? **No**: |+⟩ is certain in the X basis but random in Z.
2. If the second measurement is always the same, does this mean the outcome was predetermined before the first measurement? **No**: the first projective measurement updates the state. These facts alone do not decide quantum interpretations.
3. If 100 shots give 54 zeroes, is the model incorrect? **No**: predicted probabilities need not equal finite sample frequencies.
4. Why is a Z rotation invisible at |0⟩? **The Bloch vector direction is unchanged**; a global phase is not observable for one qubit.
5. If we repeatedly measure the *same* collapsed qubit, do we get the same histogram as 100 fresh preparations? **Not generally.** The distinction is the central teaching point.

## Design/limitations
This models an ideal, pure, single qubit with immediate projective measurements in X or Z. It does not simulate noisy qubit readout, decoherence, detector errors, non-projective measurement, or delayed dynamics. The app does not resolve interpretations of measurement or simulate hidden variables. It does not use real quantum hardware. Batch histograms depend on random draws, and no student information is saved or transmitted.

## Privacy and access
All probability calculations and experiments run in the browser. No login, backend, database, telemetry or student account is required. Results and completion progress are held only while the page is open. The final offline classroom edition remains a later milestone.
