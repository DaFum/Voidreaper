# Content Agent Instructions

## Purpose
- This folder is data only: ships, weapons, reactors, modules, effects, research, tags, and related definitions.
- Keep content declarative and avoid adding gameplay logic here.

## Rules
- Keep IDs globally unique.
- Preserve the structure expected by the validators and registries.
- Update validation coverage when content shape changes.

## Gotchas
- Content definitions often feed both equipment and ship-assembly registries, so one ID or shape change can break several subsystems at once.
- A content file may look data-only but still be part of a runtime contract through registry lookups, selectors, or validators.
- If you change a shared definition shape, search for all registries and resolvers that consume it before concluding the edit is local.

## Non-Obvious Pitfalls
- Content validators enforce fixed catalog sizes in key areas; adding/removing entries usually requires validator updates and design sign-off.
- ID changes are migration-sensitive even for "meta" content because old saves, blueprint imports, and codex history can reference those IDs.
- Some shape fields are consumed indirectly through assembly resolvers and effect systems; missing defaults may fail only at runtime, not at import.

## Validation
- Run `npm run validate-content` after content edits.
- Run `npm run validate:assembly` when ship-assembly content changes.

## Reference Docs
- [../../docs/superpowers/plans/2026-07-10-adaptive-ship-assembly-master.md](../../docs/superpowers/plans/2026-07-10-adaptive-ship-assembly-master.md)
- [../../docs/manual-validation/adaptive-ship-assembly.md](../../docs/manual-validation/adaptive-ship-assembly.md)