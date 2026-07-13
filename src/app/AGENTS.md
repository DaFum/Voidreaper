# App Wiring Instructions

## Purpose
- This folder is the integration hub: [bootstrap.js](bootstrap.js) and [game-controller.js](game-controller.js) create long-lived service singletons and connect features, render, persistence, and UI.

## Rules
- Keep this layer to wiring and orchestration; put behavior in features, state in runtime, and visuals in render.
- When adding a service, wire it in bootstrap and update every consumer selector or screen in the same pass.

## Gotchas
- Renaming a service key or changing init order can break unrelated screens with no compile error; contracts here are structural, not typed.
- Bootstrap configures hooks into the legacy runtime (e.g. `configureShipRenderer`, `configurePlayerDamageRouter`); changing hook signatures affects both worlds.
- Init order matters: some modules rely on import-time registration side effects, so preserve import order.

## Non-Obvious Pitfalls
- A "small" wiring change can ripple through many systems; verify at least one full click-path per affected screen after editing.
- [click-path-flows.js](click-path-flows.js) and [state-machine.js](state-machine.js) encode screen-flow assumptions that UI screens depend on implicitly.
- Bootstrap wraps several legacy game methods (`reset`, `startWave`, `step`, `gameOver`, `pause`, `resume`, `applyChoice`, `draw`) and UI methods (`hud`, `pauseStats`); bind the original first and keep the order-sensitive behavior. `startWave` adopts combat-run state via `adoptCombatRunState` before writing the campaign checkpoint, `gameOver` clears the checkpoint on campaign death, and the tutorial wrappers emit semantic events only after the underlying action succeeds.
- Combat nodes run in a separate run from the map's `previewRun`; checkpoints serialize `previewRun`, so combat-run state must be adopted back first. The two runs also keep separate wallets (`resources`) — do not naively copy one over the other.
- The trigger engine's chain budget resets in the `game.step` wrapper; the legacy loop runs up to 5 catch-up steps per frame, so resetting per draw frame is not equivalent.
