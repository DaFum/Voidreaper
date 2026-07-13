# Documentation Agent Instructions

## Purpose
- Use this folder for design intent, plans, specs, and validation notes.
- Do not duplicate implementation details here; link to code paths or existing docs instead.

## Editing Rules
- Keep docs aligned with the code that implements them.
- Prefer small updates that clarify behavior, validation steps, or decisions.
- If a doc changes behavior, make sure the relevant code or validation path is updated too.

## Gotchas
- These docs often describe work that is still split across phases; do not merge phase intent into a single summary unless the code already converged there.
- Manual validation notes can drift from the validator implementation, so check the script before rewriting test expectations.
- Prefer linking to the current code or plan file instead of duplicating design text that can become stale.

## Non-Obvious Pitfalls
- Some UI labels and gameplay wording are intentionally German. Avoid "normalizing" terminology unless product copy was explicitly changed in code.
- Plan docs may describe target-state architecture before all phases landed. Treat code plus validators as current behavior, and plans as intent.
- If a doc updates blueprint or save semantics, cross-check `src/persistence/` and `src/features/ship-assembly/blueprints/` to avoid publishing stale migration guidance.

## Good References
- [../AGENTS.md](../AGENTS.md) for repo-wide conventions.
- [superpowers/plans/2026-07-10-voidreaper-master-plan.md](superpowers/plans/2026-07-10-voidreaper-master-plan.md)
- [superpowers/plans/2026-07-10-adaptive-ship-assembly-master.md](superpowers/plans/2026-07-10-adaptive-ship-assembly-master.md)
- [superpowers/plans/2026-07-13-interactive-tutorial-master.md](superpowers/plans/2026-07-13-interactive-tutorial-master.md)
- [superpowers/specs/2026-07-13-interactive-tutorial-design.md](superpowers/specs/2026-07-13-interactive-tutorial-design.md)
- [manual-validation/interactive-tutorial.md](manual-validation/interactive-tutorial.md)
