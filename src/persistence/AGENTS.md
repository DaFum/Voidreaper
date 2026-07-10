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

## Validation
- Re-run the build and content checks after persistence changes.
- Verify blueprint and save compatibility when ship-assembly data is involved.