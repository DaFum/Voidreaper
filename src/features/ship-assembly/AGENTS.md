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

## Non-Obvious Pitfalls
- Blueprint import/export, save hydration, and live workbench state are separate entry points. Test more than one path after model changes.
- Node/port identity stability matters for overlays, inspector panels, and quick-mount flows; avoid regenerating IDs unless intentionally remapping.
- Geometry and flight metrics are coupled: a visual or placement tweak can unintentionally affect mass/balance/energy metrics used by gameplay systems.
- Blueprint nodes store run-local node ids; cross-run matching relies on the frame-stable `parentPortKey`, so `toBlueprintNode(node, portsById)` must receive the snapshot's `portsById` at every call site.
- Hit-zone shapes use the `kind` key everywhere; frame profiles' `coreHitZone` historically used `shape` and is normalized in `hit-zone-builder`. Broadphase bounds must cover the full capsule extent (`length/2 + radius`).
- `detachNode` records into the detached-items ledger (combat damage → remount-detached repair flow); deliberate removals go through `dismantleNode`, which passes `recordDetached: false`.
- Placement score metrics are on a 0–1 scale; any new metric fed to `scorePlacement` must be normalized to that range or it dominates the ranking.

## Reference Docs
- [../../../docs/superpowers/plans/2026-07-10-adaptive-ship-assembly-master.md](../../../docs/superpowers/plans/2026-07-10-adaptive-ship-assembly-master.md)
- [../../../docs/manual-validation/adaptive-ship-assembly.md](../../../docs/manual-validation/adaptive-ship-assembly.md)