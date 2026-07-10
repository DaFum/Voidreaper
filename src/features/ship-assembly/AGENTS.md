# Ship-Assembly Feature Instructions

## Purpose
- This folder is the core ship-assembly subsystem.
- Keep changes tightly scoped because this subsystem affects content, geometry, mounting, damage, flight, and UI.

## Rules
- Use the adaptive ship-assembly master plan and phase docs as the design source.
- Update the matching validators and adjacent layers when behavior changes.
- Keep assembly rules consistent with content definitions and persistence schema.

## Gotchas
- Assembly changes usually need coordinated updates across model, geometry, placement, mounting, damage, flight, blueprints, UI, and render code; a one-file edit is rarely enough.
- The assembly state feeds both gameplay and display snapshots, so shape changes can break renderers even if the simulation still works.
- Keep the blueprint version contract in mind when adding fields or changing saved layout data.

## Reference Docs
- [../../../docs/superpowers/plans/2026-07-10-adaptive-ship-assembly-master.md](../../../docs/superpowers/plans/2026-07-10-adaptive-ship-assembly-master.md)
- [../../../docs/manual-validation/adaptive-ship-assembly.md](../../../docs/manual-validation/adaptive-ship-assembly.md)