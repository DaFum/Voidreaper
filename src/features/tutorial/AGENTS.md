# Tutorial Feature Instructions

## Purpose

- This folder owns the declarative tutorial coordinator and its semantic event contract.
- Chapter content lives in [../../content/tutorial/tutorial-chapters.js](../../content/tutorial/tutorial-chapters.js); overlay and library rendering live under `src/ui/`.

## Rules

- Keep coordination independent of concrete screens: chapters reference semantic events and `data-tutorial-id` targets rather than DOM click handlers.
- Emit tutorial action events only after the underlying operation reports success. Keyboard, mouse, and touch paths must publish equivalent semantics.
- Required action steps may advance only from their matching event. Context-dependent actions should remain interactive but optional so missing loot, routes, checkpoints, or saved blueprints cannot block a chapter.
- Completed chapters remain repeatable even when their original availability condition is no longer met.

## Persistence and Focus

- Tutorial state is saved data. Shape changes require defaults, schema updates, and a migration under `src/persistence/`.
- Focus targets can appear after navigation or re-rendering. Keep target IDs aligned with real elements and preserve the overlay's late-target refresh and teardown behavior.
- Foundations run in isolated tutorial mode; completion, skip, and stop must leave that run without banking rewards or updating records.

## Validation

- Run `npm run validate:tutorial` after chapter, event, target, or capability changes.
- Run `npm run test:frontend` after overlay, library, or focus-target changes.
- Use `npm run build` as the final release gate.

## Reference Docs

- [../../../docs/superpowers/plans/2026-07-13-interactive-tutorial-master.md](../../../docs/superpowers/plans/2026-07-13-interactive-tutorial-master.md)
- [../../../docs/superpowers/specs/2026-07-13-interactive-tutorial-design.md](../../../docs/superpowers/specs/2026-07-13-interactive-tutorial-design.md)
- [../../../docs/manual-validation/interactive-tutorial.md](../../../docs/manual-validation/interactive-tutorial.md)
