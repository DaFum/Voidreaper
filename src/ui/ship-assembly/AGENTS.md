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

## Reference Docs
- [../../../docs/superpowers/plans/2026-07-10-adaptive-ship-assembly-master.md](../../../docs/superpowers/plans/2026-07-10-adaptive-ship-assembly-master.md)