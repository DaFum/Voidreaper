# Ship-Assembly UI Instructions

## Purpose
- This folder contains the ship-assembly UI and interaction surfaces.

## Rules
- Keep UI state and interaction logic aligned with the ship-assembly feature model.
- Update the matching ship-assembly styles together with UI changes.
- Prefer small focused edits that keep the layout, controls, and validation feedback in sync.

## Gotchas
- Many ship-assembly screens are coordinated by shared workbench and overlay flow, so changing one interaction can affect others.
- UI state here should stay derived from the assembly model where possible; duplicating state creates drift between display and gameplay.
- If you add a new control or overlay, check the matching mobile affordances and any build or blueprint feedback it needs to surface.

## Non-Obvious Pitfalls
- Keyboard/action bindings and click handlers both drive assembly actions; keep parity so one input method does not bypass validation.
- Inspector, port overlay, and placement preview depend on stable selection IDs and geometry snapshots. Race conditions appear if render order changes.
- Blueprint import/export dialogs are user-facing contract surfaces. Error wording and validation hints should remain actionable and consistent.

## Reference Docs
- [../../../docs/superpowers/plans/2026-07-10-adaptive-ship-assembly-master.md](../../../docs/superpowers/plans/2026-07-10-adaptive-ship-assembly-master.md)