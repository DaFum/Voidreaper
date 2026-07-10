# Ship-Assembly Render Instructions

## Purpose
- This folder contains ship-assembly-specific rendering code.

## Rules
- Keep render logic aligned with the ship-assembly feature model and UI layout.
- Avoid mixing gameplay rules into renderer code.
- Update the related styles when visual structure changes.

## Gotchas
- Module renderers are registered by ID; a new visual profile or core module usually needs a matching renderer entry or the fallback path will warn.
- Geometry state, damage state, and activity telemetry are part of the renderer contract, so verify those inputs before changing draw code.
- If a visual tweak needs layout changes, update the UI or style layer in the same pass to avoid a mismatch between interaction and display.

## Reference Docs
- [../../../docs/superpowers/plans/2026-07-10-adaptive-ship-assembly-master.md](../../../docs/superpowers/plans/2026-07-10-adaptive-ship-assembly-master.md)