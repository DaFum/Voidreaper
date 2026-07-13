# Legacy Runtime Instructions

## Purpose
- [legacy-runtime.js](legacy-runtime.js) is the original monolithic game runtime (~2000 lines). It is being wrapped, not replaced.

## Rules
- Prefer extending via the hook points bootstrap configures (e.g. `configureShipRenderer`, `configurePlayerDamageRouter`) over editing runtime internals.
- Do not refactor or split this file as a side effect of another task; that is its own coordinated project.

## Gotchas
- The runtime holds its own state and update loop; modern services observe and hook into it rather than owning it.
- Behavior here can duplicate modern feature logic; when both exist, check which path is live before changing either.
- Edits deep in this file are hard to test in isolation; verify via `npm run build` and a manual click-path.
- Import-time DOM lookups (game canvas, joystick `#stick`/`#knob`) fall back to detached elements and `resize()` bails without a 2D context, so the module can be imported in a DOM environment where those elements are missing. It still requires `window`/`document` to exist — pure-Node import is not supported.
- Bootstrap wraps `reset`, `startWave`, `step`, `gameOver`, `pause`, `resume`, `applyChoice`, and `draw` on the game object plus `hud` and `pauseStats` on the legacy UI; renaming or restructuring those methods breaks the modern wiring silently.
