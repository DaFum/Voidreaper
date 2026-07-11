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
