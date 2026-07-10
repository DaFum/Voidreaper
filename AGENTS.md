# Voidreaper Agent Instructions

## What This Repo Is
- This is a Vite-based game project. The entrypoint is [src/main.js](src/main.js), and startup wiring begins in [src/app/bootstrap.js](src/app/bootstrap.js).
- Treat the design and validation docs as the source of truth for intent; link to them instead of restating them.

## Key Docs
- [docs/superpowers/plans/2026-07-10-voidreaper-master-plan.md](docs/superpowers/plans/2026-07-10-voidreaper-master-plan.md)
- [docs/superpowers/specs/voidreaper-master-spezifikation.md](docs/superpowers/specs/voidreaper-master-spezifikation.md)
- [docs/superpowers/plans/2026-07-10-adaptive-ship-assembly-master.md](docs/superpowers/plans/2026-07-10-adaptive-ship-assembly-master.md)
- [docs/manual-validation/adaptive-ship-assembly.md](docs/manual-validation/adaptive-ship-assembly.md)

## Validation
- `npm run build` runs both validators and then the Vite production build.
- Use `npm run validate-content` for content and registry changes.
- Use `npm run validate:assembly` for ship-assembly and blueprint changes.

## Gotchas
- The ship-assembly pipeline is not isolated: content, geometry, rendering, UI, persistence, and validators all cross-check each other.
- `npm run build` is the safest final check because it catches content and assembly regressions before Vite compiles.
- When a change touches save data or blueprint shape, treat it as a compatibility change and verify the migration path.

## Working Rules
- Keep edits small and local to the owning subsystem.
- Preserve existing conventions and avoid broad refactors unless the task needs them.
- Keep content IDs globally unique and keep validation passing.
- Treat save-schema and migration changes as versioned API changes.