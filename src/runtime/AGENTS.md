# Runtime State Instructions

## Purpose
- Factories and selectors for run, player, and meta state ([create-run-state.js](create-run-state.js), [create-player-state.js](create-player-state.js), [create-meta-state.js](create-meta-state.js), [selectors.js](selectors.js)).

## Rules
- Keep state shapes complete at creation time; consumers must not need UI-side fallback defaults.
- When adding a field, ensure it survives save/load and default initialization, not only the in-memory happy path.

## Gotchas
- Run-state slices are "dual ownership" objects shared across feature, UI, and render layers; shape changes must be coordinated across all consumers.
- Defaults created here (e.g. `assemblyVisualPreferences`) are read directly by bootstrap and render policies; renaming a field silently changes behavior instead of failing.
- New persistent fields usually need a matching migration in `src/persistence/`.
