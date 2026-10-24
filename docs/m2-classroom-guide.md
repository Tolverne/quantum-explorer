# Quantum Explorer M2 — classroom guide

**Audience:** high-achieving Year 10 mathematics/science students preparing for Year 11 Physics and a visit to the UQ National Quantum Computing Testbed.

**Intended use:** student investigation in Lesson 1, after an introduction to a qubit and the Bloch sphere. This is not a formal treatment of quantum mechanics or a substitute for the practical hardware session.

## Learning intentions
By the end, students should be able to:
- identify the north/south poles and the X/Y/Z axes;
- explain that pulses rotate a *quantum state representation*, not a physical arrow;
- construct and replay short rotations to prepare a target state;
- predict why axis order and direction change the final result;
- recognise that equatorial vectors are possible qubit states and that a Z rotation can matter even when Z-basis populations would be unchanged.

## Suggested 50–60 minute sequence
1. **5 minutes:** Compare a classical bit with the Bloch sphere. Clarify that the arrow is a way to visualise a quantum state.
2. **10 minutes:** Free Explore: rotate from |0⟩ to |1⟩ and back. Encourage predictions before pressing a pulse. Show the camera lock and undo/replay.
3. **20 minutes:** Challenge mode: attempt Missions 1–4 individually or in pairs. Ask students to record the sequence of rotations that worked.
4. **10 minutes:** Missions 5–6: seek the fewest pulses, compare solutions and explore why the order of pulses matters.
5. **5–10 minutes:** Whole-class discussion: what happens when a rotation is about the axis the Bloch vector already points along? How can the same state be reached by different routes?

## Challenge solutions for teachers
The following are examples with positive angles, and not the only possible solutions:

| Mission | Starting state | Target | One example |
|---|---|---|---|
| 1 Flip a bit | +Z | −Z | X(+180°) |
| 2 Discover the equator | +Z | +X | Y(+90°) |
| 3 Another superposition | +Z | −Y | X(+90°) |
| 4 Change the phase | +X | +Y | Z(+90°) |
| 5 Two-pulse route | +Z | +Y | Y(+90°), then Z(+90°) |
| 6 Find your way home | +X | +Z | Z(+90°), then X(+90°) |

Students can use fixed-angle gates or continuous on-sphere holds. In the latter case the end angle depends on the duration; a 10° tolerance gives reasonable leeway.

## Questions for discussion
- Why can two rotation sequences reach the same target?
- Does rotating about Z have a visible effect at the north pole? What about at +X?
- Does the perspective of the camera affect the *state*, or just how you see it?
- If we can make the arrow point somewhere on the equator, what do you think measurement will show?

## Scope and limitations
The challenges use an ideal single-qubit model. There is **no quantum measurement** yet; this is planned for M3. The app's target arrow shows a desired state, not an additional qubit. There is no claim of displaying a literal quantum object. A vector's direction represents a pure qubit state up to global phase. The challenge checker compares Bloch directions with a 10° tolerance and does not assess physical pulse errors, decoherence or uncertainty in preparation.

## Privacy and distribution
The app runs locally in each browser. Challenge completion is only held in React memory for the current visit; it disappears on page refresh. No accounts or uploads are required. After merging into main, GitHub Pages publishes the site automatically. A self-contained offline edition is planned separately for M6.
