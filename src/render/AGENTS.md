# Render Agent Instructions

## Purpose

- Rendering code turns game state into visuals and should stay separate from gameplay rules.

## Rules

- Keep state mutation out of render code.
- If a visual depends on new feature or content data, update the rendering path closest to that concern.
- Keep camera, world, entity, and effects responsibilities separated when possible.

## Gotchas

- Renderers often consume snapshot shapes produced elsewhere; do not assume the renderer can compensate for missing or renamed fields.
- Several ship-assembly renderers depend on geometry helpers and registry output, so a visual ID change usually needs both content and renderer updates.
- Avoid adding gameplay branching here just to work around a missing model field; fix the upstream data contract instead.

## Non-Obvious Pitfalls

- Rendering bugs can originate in stale caches or memoized geometry snapshots upstream; verify data freshness before rewriting draw logic.
- Keep render output deterministic for the same snapshot/time inputs, especially where thumbnails or previews are generated.
- Do not silently swallow unknown profile IDs in hot paths; explicit warnings are preferred so broken content is visible early.

## Ship-Assembly Note

- Ship-assembly rendering changes should stay aligned with the ship-assembly feature and its CSS/UI files.

## PixiJS Stages (`pixi/`)

- `pixi/environment-stage.js` renders the backdrop (sky, nebula, starfield, dust) on a separate WebGL canvas *below* `#game`; the legacy runtime drives it via `configureEnvironmentRenderer` and keeps its 2D-canvas backdrop as fallback when Pixi init fails.
- `pixi/combat-fx-stage.js` renders combat particles, shockwave rings and the bloom post-pass on a transparent overlay canvas *above* `#game` (hook: `configureCombatFxRenderer`, two-phase `capture`/`present` contract — capture is called mid-draw at the particles' z-position, present once per loop after the 2D frame is finished). The legacy 2D particle/bloom path stays as fallback.
- Keep `pixi/environment-scene.js` and `pixi/combat-fx-scene.js` free of `pixi.js` imports: they hold the pure, seeded spec builders / math helpers and are covered by `tests/render/pixi-environment.test.js` and `tests/render/combat-fx.test.js` (every `REGION_VISUAL_PALETTES` key needs an environment theme).
- Only the stage modules may import `pixi.js`, and only via the dynamic imports in `bootstrap.js`, so the library stays out of the main bundle, node tests, and validators.
