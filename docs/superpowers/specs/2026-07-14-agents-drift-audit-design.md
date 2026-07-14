# AGENTS Drift Audit Design

## Goal

Audit every `AGENTS.md` in the repository against the current codebase and update only files with demonstrable drift. Preserve correct guidance and avoid template-driven rewrites.

## Scope

- Review all 21 repository-local `AGENTS.md` files.
- Compare each file with the code, paths, scripts, validators, and ownership boundaries in its directory scope.
- Include recent hangar catalog, loadout persistence, tutorial, ship-assembly, rendering, and validation changes where they materially affect future work in that scope.
- Do not modify production code, tests, or unrelated documentation as part of this audit.
- Preserve the existing uncommitted review-fix changes without folding them into AGENTS-specific commits.

## Drift Criteria

An `AGENTS.md` requires an edit only when at least one of these conditions is proven:

1. A referenced path, command, behavior, or contract is no longer accurate.
2. The documented ownership boundary conflicts with the current implementation.
3. A current high-risk integration or validation requirement is missing and is likely to cause incorrect future changes.
4. Existing guidance is ambiguous in a way that the current code resolves clearly.

General advice, stylistic normalization, and speculative future guidance do not qualify as drift.

## Audit Method

For each file:

1. Resolve all local Markdown links relative to that file.
2. Verify named files, directories, npm scripts, and validators exist.
3. Inspect the owning subsystem's entry points and current public contracts.
4. Compare recent relevant commits and the current working tree without treating uncommitted changes as committed history.
5. Record the file as either `updated` with evidence or `unchanged` with a short reason.

## Editing Rules

- Make the smallest edit that corrects the verified drift.
- Match the file's existing structure and tone.
- Prefer concrete path, contract, or validation guidance over broad summaries.
- Do not duplicate detailed design documents inside AGENTS files; link to the source document when appropriate.
- Do not add volatile test counts, commit hashes, or temporary branch state.

## Validation

The completed audit must pass:

- A repository-wide local Markdown-link check for all `AGENTS.md` files.
- Verification that every referenced npm command exists in `package.json`.
- `git diff --check`.
- A final diff review confirming only drift-backed AGENTS changes and the approved audit documentation were introduced.

The handoff will list updated files and summarize why the remaining files were intentionally left unchanged.
