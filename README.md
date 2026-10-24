# Quantum Explorer

A free, account-free browser learning app for Year 10 quantum physics.

**Live classroom app after deployment:** https://tolverne.github.io/quantum-explorer/

## M1 — Bloch sphere lab
Explore a single pure qubit on an orbitable, three-dimensional Bloch sphere. Hold an X/Y/Z label to rotate continuously, or use fixed ±90° and 180° pulses. The app records one pulse per hold and supports undo, replay, reset and camera lock.

## M2 — Target-state challenges
Switch between **Challenges** and **Free Explorer**. Challenge mode includes six progressively harder visual investigations:
1. Flip |0⟩ to |1⟩ using X.
2. Reach |+⟩ (+X) using Y.
3. Reach |−i⟩ (−Y) using X.
4. Turn +X into +Y using Z (a phase change).
5. Reach +Y from the north pole using only Y and Z.
6. Return from +X to the north pole using only X and Z.

Each challenge begins from a known prepared state, shows a **translucent cyan target arrow**, limits available axes and has a hint and a check button. The check measures *angular distance between Bloch vectors*, not the camera orientation. Students succeed within **10°** of the target, helpful for mouse-held continuous rotations. Completions are stored **in memory only for the current session**; no student accounts or progress uploads.

The displayed example pulse count is a reference, not a grading penalty. Fixed-angle gate buttons and on-sphere press-and-hold rotations both count as pulses.

## Run locally

Node.js 20+ recommended:

```sh
npm install
npm run dev
npm test
npm run build
```

All state simulation and challenge scoring run in the browser: no server API, sign-in, analytics or personal information collection. An intentionally packaged, self-contained offline distribution is planned for M6.

## Physics and design
- Rotation of a pure qubit is modelled by a unit Bloch vector and Rodrigues' formula.
- Positive angles use the right-hand rule; 180° X/Y/Z rotations are Pauli gates up to global phase.
- An axis-aligned state can appear stationary under rotation about that same axis.
- The cyan arrow is a visual goal, **not** another qubit or a measurement.
- A Bloch vector does not display global phase; measurement is planned for M3.
- Camera speed is **1.55** in OrbitControls (between the M1 initial and previous fast setting).

## Teacher resources
See [M2 classroom guide](docs/m2-classroom-guide.md) for suggestions on investigation flow, student predictions, what to discuss and what the challenges do and do not show.

## Roadmap
M1 rotations ✓ → M2 target challenges ✓ → M3 measurement → M4 entanglement → M5 complete curriculum → M6 offline distribution.
