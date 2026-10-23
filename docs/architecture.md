# M1 architecture

- React and TypeScript UI, Three.js via React Three Fiber for an orbitable Bloch sphere.
- Pure computation in `src/quantum/bloch.ts`, independent of React and WebGL.
- Animated rotations interpolate the **angle** of the rotation rather than linearly interpolating Bloch vectors (which would cut through the sphere).
- A single state vector is always derived from the sequence of unit rotations; undo reconstructs from the history to avoid numerical drift.
- Animation is guarded against overlapping commands; replay retains the history.
- Positive rotation uses the right-hand rule around the selected Bloch axis.
- The app is client-side with no student identity or data transmitted.

## M1 boundaries
M1 deliberately models pure one-qubit states only and does not include measurement, shot statistics, two-qubit states, real hardware integration, offline self-contained HTML release or classroom worksheet.

## QA
`npm test` checks gate convention, state preparation, Z-phase invariance, inverse rotations and normalisation. `npm run build` checks TypeScript compilation and asset bundling. Visual testing on school hardware is required before classroom use.
