# Scripts Agent Instructions

## Purpose
- This folder contains repository validators and build-adjacent tooling.
- Keep scripts deterministic and easy to run in CI and local shells.

## Rules
- If a script enforces content shape, update the validator before or alongside the content change.
- Prefer clear failure messages over silent recovery.
- Do not move product logic into scripts; scripts should validate or automate, not implement gameplay.

## Gotchas
- `scripts/validate-ship-assembly-content.mjs` imports feature and render code, so a rendering registry change can break validation even when no script file changed.
- Validators are part of the release gate; do not widen or soften checks unless the content schema genuinely changed.
- Keep script output stable enough that the failure reason is obvious when a count or ID mismatch occurs.

## Relevant Commands
- `npm run validate-content`
- `npm run validate:assembly`
- `npm run build`