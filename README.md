# Quantum Explorer

A no-login, browser-based learning app for Year 10 quantum physics.

## M1: Bloch sphere lab
Visualise a single pure qubit and animate rotations about the X, Y and Z axes. Includes 90°, −90°, and 180° pulses, a pulse history, undo, replay and reset. Drag to orbit the sphere.

### Development
Requires Node.js 20+.

```sh
npm install
npm run dev
npm test
npm run build
```

All simulation runs in the browser: no accounts, server API or student data collection. The app is not yet a packaged offline classroom edition (planned M6).

### Physics
Single-qubit state evolution is computed using Rodrigues' rotation formula on the unit Bloch vector. X/Y/Z 180° gates act as corresponding Bloch rotations up to global phase. Positive angles follow the right-hand rule. A Z rotation leaves the north-pole Bloch vector unchanged: global phase is not displayed.

### Roadmap
M1 rotations → M2 target challenges → M3 measurement → M4 entanglement → M5 curriculum → M6 offline distribution.
