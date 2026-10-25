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

Each challenge begins from a known prepared state, shows a **translucent cyan target arrow**, limits available axes and has a hint and a check button. The check measures *angular distance between Bloch vectors*, not the camera orientation. Students succeed within **10°** of the target, helpful for mouse-held continuous rotations. Challenge completions are **automatically saved in this browser's IndexedDB**; no student accounts or progress uploads.

The displayed example pulse count is a reference, not a grading penalty. Fixed-angle gate buttons and on-sphere press-and-hold rotations both count as pulses.

## M3 — Quantum measurement laboratory

Select the **Measurement lab** tab to explore the crucial distinction between a *quantum state* and the *outcome of an experiment*. The M3 lesson adds:

- State presets |0⟩, |1⟩, |+⟩ and |−⟩, or arbitrary preparations via the same Bloch sphere pulse controls used in M1.
- **Z-basis (0/1)** and **X-basis (+/−)** measurement, with Born-rule probabilities displayed before each result.
- **Single-qubit measurement:** one randomly sampled outcome updates/collapses the actual state. Measure that same qubit again or re-prepare the original state.
- **Repeated trials:** collect 10, 100 or 1,000 measurements with fresh preparation for *each* trial. Compare observed frequency bars with the theoretical probability markers.
- A cyan reference arrow after a single measurement to show the pre-measurement prepared state.
- Built-in sample questions and a [Lesson 2 teacher guide](docs/m3-measurement-classroom-guide.md).

The measurement engine is in [src/quantum/measurement.ts](src/quantum/measurement.ts) with deterministic unit tests for probability, X/Z basis changes, state collapse and independent preparations. **No hardware is contacted**; this is an ideal single-qubit simulator, not a quantum computer. The deeper interpretation of the measurement problem is not resolved by this model.

## M4 — Entanglement laboratory
Select **Entanglement lab** to explore the difference between ordinary randomness, classical correlations, and an entangled two-qubit state.

- Four preparations: independent |+⟩|+⟩, a genuine classical 00/11 mixture, Bell Φ+, and Bell Φ−.
- Two separate Bloch spheres show each qubit's *reduced* state. The centre dot represents a maximally mixed local state for Bell pairs, rather than pretending each qubit has its own pure Bloch arrow.
- Choose X or Z basis for Alice and Bob independently. Measure Alice first and see Bob's **conditional** state, then measure Bob.
- Generate 10, 100 or 1,000 fresh-pair shots and compare joint outcome histograms (00,01,10,11 or +/− equivalents) with Born-rule probabilities.
- Compare ZZ and XX correlations. A classical 00/11 mixture and Bell Φ+ both agree in ZZ, but only Bell Φ+ agrees perfectly in XX. Bell Φ− has opposite XX outcomes.
- Optional extension: two-basis entanglement witness ⟨ZZ⟩+⟨XX⟩ ≤ 1 for separable states. The app labels finite-shot measurements as indicative rather than conclusive.

The [M4 teacher guide](docs/m4-entanglement-classroom-guide.md) includes timed investigations, predictions, mathematical details and important caveats about no-signalling.

**Physics scope:** two-qubit 4×4 real density matrices with correct mixture handling, H/CNOT Bell preparation, partial traces and X/Z projective measurements. This is an ideal **browser simulator** and does not access NQCT hardware. Complex-amplitude Y-basis operations are outside M4's scope.

## M5 — Standalone guided teaching module
The app now opens on a **Guided Lessons** dashboard with three complete ~60-minute lessons (12 student investigations). Each activity follows **Predict → Experiment → Explain**, with the relevant physics lab directly below the lesson prompts. Activities provide self-checking scientific explanations, optional teacher notes, estimated timings and recorded progress. Students can also switch to the original unguided labs.

- **Lesson 1:** What is a qubit? Bloch-sphere poles, superpositions, axis rotations and pulse-order challenge.
- **Lesson 2:** What is measurement? Prediction vs outcome, collapse, fresh shots and choice of measurement basis.
- **Lesson 3:** What is entanglement? Independent pairs, classically correlated pairs and Bell-state measurements in X/Z.

**No student account, personal identifiers or backend are required.** Guided-lesson predictions, written observations, reflections, completion status and challenge progress are automatically saved to IndexedDB in the same browser. Students can return to their work after closing and reopening the site, so long as the browser retains its storage. The **Download my journal** button exports an anonymous Markdown file to the student's device for printing or submission through Teams or a school LMS. A **Clear saved answers** option is provided for shared devices.

Printable resource pages (open in a browser and print/save using the browser print command):
- [Student workbook](public/resources/student-workbook.html)
- [Teacher guide with timing, answers and misconceptions](public/resources/teacher-guide.html)

On GitHub Pages, these are also available directly at:
- https://tolverne.github.io/quantum-explorer/resources/student-workbook.html
- https://tolverne.github.io/quantum-explorer/resources/teacher-guide.html

The teacher resources are public, not password-protected. There is no tracking or login. The app is a static web learning module; packaging as a **single offline classroom HTML file** is reserved for M6.

## M6 — Single-file offline classroom edition

Quantum Explorer remains a normal hosted website at **https://tolverne.github.io/quantum-explorer/**. It also offers a **Download offline edition (.html)** link on the Guided Lessons home page. The offline file contains the same three guided lessons and all four laboratories, their simulations, their CSS/JavaScript and both printable resources. It opens directly in a modern browser with no network, account, server or installation.

**Public download (after M6 is merged and Pages deployment succeeds):**
https://tolverne.github.io/quantum-explorer/downloads/quantum-explorer-offline.html

To use in a classroom:
1. While online, visit the site and choose **Download offline edition (.html)**. Save the file somewhere students can reach, such as a school network share, a USB drive, or an LMS download.
2. Disconnect from the internet if you wish to verify offline operation.
3. Double-click the saved \`quantum-explorer-offline.html\`. It runs locally in Chrome, Edge or a WebGL-capable browser.
4. Open Guided Lessons to use all three lessons. Use **Print student workbook** / **Print teacher guide** to open the embedded printable resources from the same file.
5. Students' answers are automatically saved in IndexedDB when available, including across browser restarts. They should **Download my journal** before submitting through Teams or another school platform. Saved work is not synced between devices or browsers.

The HTML file is deliberately larger than the hosted edition because it contains everything, including the full 3D simulator. It is a single file, not a ZIP or installer. It does not contain nor require student data.

### Maintainer build commands

\`\`\`sh
npm install
npm test
npm run build            # unchanged normal website in dist/
npm run build:offline    # one HTML file in dist-offline/
npm run build:release    # website + validated offline file in dist/downloads/
\`\`\`

The release build runs \`scripts/verify-offline.mjs\`, which rejects external JavaScript/CSS/preload references, online font references and missing embedded teaching documents. The live site's GitHub Pages pipeline runs the release build automatically, and PR CI also uploads the offline HTML as a review artifact.

The 3D sphere labels use local browser canvas textures rather than the previous remotely hosted 3D font. The offline resources are embedded within the generated HTML and can be opened through browser print views even with no network connection.

**Compatibility and limitations:** Requires a modern desktop/mobile browser with WebGL enabled. Some managed school devices prohibit locally opened HTML or WebGL and may need local IT approval. Pop-up blockers may prevent the embedded print view; the app offers a printable HTML download as a fallback. No web-hosting account is required to run a file locally. The offline version intentionally does not receive automatic updates; download a newer edition after future releases. 

## Automatic saved work (IndexedDB)

Quantum Explorer saves a student's **guided-lesson predictions, observations, reflections, completion flags, and completed Bloch challenges** automatically to IndexedDB in the browser. There is no login, student identity, analytics, cloud backup, or server storage. Students may close and reopen the same site in the same browser to continue their work.

- **Live site:** Save data is associated with the site's browser origin. Switching browser profiles, devices or browsers does not transfer work.
- **Single-file offline version:** Supports IndexedDB where the browser permits local \`file://\` storage, but local-file origins and permissions vary; moving or renaming the downloaded file may make old storage inaccessible. Always check the save indicator. If storage is blocked, the app still works in memory and shows an explicit warning.
- **Shared school computers:** Local work may be visible to whoever next uses that browser profile. Students should **Download my journal (.md)** for submission (for example in Microsoft Teams) and then choose **Clear saved answers from this browser**.
- **Loss of local data:** Private/incognito windows, storage policies, disk quotas, or clearing browser data may remove saved work. IndexedDB is useful convenience storage, not guaranteed backup.
- The user-facing indicator distinguishes **Saving locally**, **Saved on this device**, and **Automatic saving unavailable**.
- No auto-upload to Teams or other external service occurs.

\`src/persistence/studentWork.ts\` contains a versioned on-device data record and schema validation. \`src/persistence/useStudentWork.ts\` restores that record before presenting editable activities and writes each edit in a committed IndexedDB transaction. Tests use an injected \`fake-indexeddb\` factory to verify saving, restoring, resetting and unsupported browsers.

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
- A Bloch vector does not display global phase; projective X/Z measurements are included in M3.
- Camera speed is **1.55** in OrbitControls (between the M1 initial and previous fast setting).

## Teacher resources
See [M2 classroom guide](docs/m2-classroom-guide.md) for suggestions on investigation flow, student predictions, what to discuss and what the challenges do and do not show.

## Roadmap
M1 rotations ✓ → M2 target challenges ✓ → M3 measurement ✓ → M4 entanglement ✓ → M5 complete curriculum ✓ → M6 offline distribution ✓.
