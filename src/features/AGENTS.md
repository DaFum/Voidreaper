# Features Agent Instructions

## Purpose
- Feature folders hold the game systems and subsystem behavior.
- Keep feature logic self-contained and coordinate shared behavior through core utilities or runtime state.

## Rules
- Prefer feature-local changes over broad engine changes.
- When a feature depends on new content, persistence, or render behavior, update those layers together.
- Keep feature names and responsibilities aligned with the folder they live in.

## Gotchas
- Many feature folders are integration-heavy even when they look isolated; check the surrounding UI, render, and persistence code before changing public behavior.
- Feature code should usually orchestrate behavior, not own content validation or save migration logic.
- If a feature change introduces a new service or registry shape, update the bootstrap wiring and any consumer selectors together.

## Non-Obvious Pitfalls
- Feature services are often long-lived singletons created in bootstrap; changes to constructor expectations can break startup before screens render.
- Event payload shapes on the shared event bus act as implicit APIs. Keep backward compatibility when possible or migrate all listeners at once.
- Avoid putting fallback defaults only in UI. Core feature models should emit stable, complete state for all consumers.
- Equipment catalog state (unlock status and equipped-slot mapping) is derived in [equipment/loadout-service.js](equipment/loadout-service.js); UI catalogs should consume that domain state rather than rebuilding it.
- Controllers holding per-run state (drones, mines, infections, …) must be created per run — typically inside a weapon adapter's `createState()` — never at module scope, or state leaks across runs.
- The canonical corruption field on item *instances* is `corruptionLevel`; readers should fall back to the legacy `corruption` field, and run-level corruption changes must go through the corruption system (`changeRunCorruption`) so state and the `corruption-changed` event payload stay real.
- Energy `ratio` and `tier` are derived together; never set `energy.ratio` directly — go through `energySystem.recalculate` (or `calculateLoad`) so `LOAD_MODIFIERS[tier]` consumers see a consistent tier.

## Ship-Assembly Note

- Ship-assembly work is coupled to content, geometry, mounting, damage, flight, UI, and rendering.
- Use the adaptive ship-assembly docs as the design reference rather than recreating the spec in code comments.
