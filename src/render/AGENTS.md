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

## Ship-Assembly Note
- Ship-assembly rendering changes should stay aligned with the ship-assembly feature and its CSS/UI files.