# Phase 1: Lab Renderer Analysis

Based on the decoding of the `Voidreaper Renderer Lab.html` bundle:

- `forged-abyss/seeded-visuals.js`: Unchanged from repo
- `forged-abyss/palettes.js`: refined/expanded. **Adopted** the refined and expanded `FORGED_ABYSS_PALETTE` tonal steps.
- `forged-abyss/primitives.js`: **Adopted** richer rim, sheen, or contact-shadow usage the Lab adds. **Rejected** the missing alpha state isolation.
- `enemies/enemy-visual-profiles.js`: Unchanged from repo
- `enemies/enemy-renderer.js`: **Rejected** the enemy chord bug (`filter(p => p.y < 0)`).
- `ship-assembly/path-primitives.js`: Unchanged from repo
- `ship-assembly/module-core-renderers.js`: **Adopted** the mounting-collar double-stroke module upgrade. **Rejected** the removed `normalizeSeed`, the dropped `ctx.save()`/`ctx.restore()` calls.
- `ship-assembly/core-renderer.js`: priority review complete. No functional differences found.

Result:
Adopt:
- The refined and expanded `FORGED_ABYSS_PALETTE` tonal steps (`forged-abyss/palettes.js`).
- The mounting-collar double-stroke module upgrade (`ship-assembly/module-core-renderers.js`).
- Any richer rim, sheen, or contact-shadow usage the Lab adds (`forged-abyss/primitives.js`).

Reject:
- The enemy chord bug (`filter(p => p.y < 0)`) in `enemies/enemy-renderer.js`.
- The removed `normalizeSeed` in `ship-assembly/module-core-renderers.js`.
- The dropped `ctx.save()`/`ctx.restore()` calls in `ship-assembly/module-core-renderers.js`.
- The missing alpha state isolation in `forged-abyss/primitives.js`.
