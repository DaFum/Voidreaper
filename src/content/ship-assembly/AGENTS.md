# Ship-Assembly Content Instructions

## Purpose
- This folder holds ship-assembly data definitions and related content.

## Rules
- Keep definitions declarative and validation-friendly.
- Preserve blueprint versioning and the content shape expected by the assembly validator.
- If a new assembly concept is added, update the matching docs and validator together.

## Gotchas
- Blueprint and module-shape changes are compatibility-sensitive; a small field rename can break save migration or import paths.
- This content is consumed by ship-assembly rendering and damage behavior as well as assembly logic, so validate cross-layer assumptions before changing schemas.
- The validator expects consistent profile families, so adding a new profile usually means updating both the definition and the registry path that reads it.

## Non-Obvious Pitfalls
- Visual profile IDs are coupled to renderer registries and damage behavior maps in other folders; adding one often requires changes in at least three places.
- Core geometry IDs are validated against renderer support. A profile can look valid as data but still fail when geometry builder IDs drift.
- Blueprint version and migration logic are part of this contract; schema additions without migration updates create delayed failures on load/import.

## Validation
- Run `npm run validate:assembly` after changes here.

## Reference Docs
- [../../../docs/superpowers/plans/2026-07-10-adaptive-ship-assembly-master.md](../../../docs/superpowers/plans/2026-07-10-adaptive-ship-assembly-master.md)