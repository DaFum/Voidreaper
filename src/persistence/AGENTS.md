# Persistence Agent Instructions

## Purpose

- This folder owns save data, schema evolution, and migrations.

## Rules

- Treat schema changes as versioned changes.
- Add or update migrations whenever saved data shape changes.
- Keep reads forgiving where possible, but do not hide incompatible schema changes.

## Gotchas

- Ship-assembly save changes are especially sensitive because blueprint data and assembly state must stay compatible with existing saves.
- A migration may need to touch both generic save data and assembly-specific fields, so check the full migration chain before editing one file in isolation.
- If you change the schema, verify both loading and exporting paths rather than only the migration function.

## Non-Obvious Pitfalls

- `migrateSave` supports legacy and modern inputs; changes must preserve both paths and keep migration history/backups meaningful.
- Newer-than-supported saves currently warn instead of hard-failing. Avoid assumptions that every loaded save was produced by this version.
- Save defaults, migration output, and UI expectations must stay aligned; missing optional fields often fail later in tabs/screens rather than during load.
- `save-store.js` writes the main key directly — a single-key `setItem` is atomic (it fully replaces the value or throws leaving the old one intact). Do not reintroduce a write-ahead/pending scheme; it doubles peak storage footprint for no safety.
- A stranded `-pending` key from older builds is recovered on load but only removed after the main-key write succeeds — under quota/private-mode failures it can be the sole durable copy of the save.
- `save()`/`update()` surface write failures through `onWarning` (wired to a toast in bootstrap) and then rethrow; keep that contract so quota errors are never silent.

## Validation

- Re-run the build and content checks after persistence changes.
- Verify blueprint and save compatibility when ship-assembly data is involved.
