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

## PixiJS Environment Stage (`pixi/`)

- `pixi/environment-stage.js` renders the backdrop (sky, nebula, starfield, dust) on a separate WebGL canvas *below* `#game`; the legacy runtime drives it via `configureEnvironmentRenderer` and keeps its 2D-canvas backdrop as fallback when Pixi init fails.
- Keep `pixi/environment-scene.js` free of `pixi.js` imports: it holds the pure, seeded spec builders and region themes and is covered by `tests/render/pixi-environment.test.js` (every `REGION_VISUAL_PALETTES` key needs a theme there).
- Only the stage module may import `pixi.js`, and only via the dynamic import in `bootstrap.js`, so the library stays out of the main bundle, node tests, and validators.
