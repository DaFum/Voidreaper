# Source Agent Instructions

## Layering
- Keep implementation in the narrowest owning layer: app wiring, core utilities, runtime state, features, render, persistence, input, audio, styles, or UI.
- Prefer local helpers over cross-layer imports when the same concern already exists nearby.

## Conventions
- Match the existing module style in nearby files.
- Keep shared code in [core](core/) and feature behavior in [features](features/).
- When a change spans state, content, rendering, or persistence, update the related layer together instead of hiding the coupling.

## Gotchas
- `src/app/bootstrap.js` and `src/app/game-controller.js` are major wiring points; changes there can ripple through many systems even when the edit looks small.
- Avoid creating circular dependencies between features, renderers, and content registries.
- Some modules rely on import-time registration or side effects, so preserve import order when a file initializes global state.

## Non-Obvious Pitfalls
- Runtime contracts here are often structural rather than typed. A renamed field on a snapshot/service object can silently break UI or render consumers.
- Keep an eye on "dual ownership" objects shared across feature, UI, and render (assembly snapshots, blueprint metadata, run state slices).
- If you add new cross-layer state, ensure it survives save/load and default initialization, not only the happy-path in-memory flow.

## High-Risk Areas
- Content and persistence changes can fail validation or require migrations.
- Ship-assembly work usually touches several layers; keep those edits coordinated.