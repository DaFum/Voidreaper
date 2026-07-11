# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Voidreaper is a Vite-based browser game (canvas 2D roguelite). Entry point is `src/main.js` (imports all global CSS, then calls `bootstrap()`); startup wiring lives in `src/app/bootstrap.js`. No TypeScript, no linter — plain ES modules (`"type": "module"`). UI copy and gameplay wording are intentionally German; don't "normalize" it to English.

## Commands

- `npm test` — run all tests (Node's built-in test runner, discovers `tests/**/*.test.js`)
- `node --test tests/ui/blueprint-ux.test.js` — run a single test file
- `npm run build` — content validator + assembly validator + Vite production build. This is the release gate and the safest final check.
- `npm run validate-content` — for content/registry changes
- `npm run validate:assembly` — for ship-assembly and blueprint changes
- `npm run dev` — Vite dev server

## Validators Are Contracts, Not Just Schemas

- `scripts/validate-content.mjs` enforces product-level contracts including **fixed catalog counts** (ships, weapons, reactors, modules, chips). Adding/removing content usually means updating the validator alongside it.
- `scripts/validate-ship-assembly-content.mjs` **imports feature and render modules**, so a change outside `scripts/` (e.g. a renderer registry) can break validation even when no content file changed.
- Content IDs must be globally unique.

## Architecture

Layered `src/` tree; keep edits in the narrowest owning layer:

- `src/app/` — wiring hub. `bootstrap.js` and `game-controller.js` create long-lived service singletons and connect everything. High-risk: renaming a service key or changing init order breaks unrelated screens with no compile error.
- `src/core/` — shared utilities (event-bus, registry, rng, schema, math).
- `src/runtime/` — run/player/meta state factories and selectors.
- `src/features/` — game systems (combat, sectors, merchant, ship-assembly, salvage, research, …). Features orchestrate behavior; they don't own content validation or save migrations.
- `src/content/` — data catalogs (modules, ships, weapons, sectors, …) validated by the scripts above.
- `src/render/` — canvas renderers (`ship-assembly/`, `enemies/`, `regions/`, `forged-abyss/` shared primitives and palettes).
- `src/persistence/` — save schema, save-store, versioned migrations.
- `src/ui/` — screens and components (DOM-based, not canvas).
- `src/legacy/legacy-runtime.js` — the original monolithic game runtime (~1800 lines); bootstrap configures hooks into it (e.g. `configureShipRenderer`, `configurePlayerDamageRouter`) rather than replacing it.

Cross-cutting facts that bite:

- Contracts are structural, not typed. Snapshot/service object fields and event-bus payload shapes are implicit APIs — a renamed field silently breaks UI/render consumers. Migrate all listeners at once.
- "Dual ownership" objects (assembly snapshots, blueprint metadata, run-state slices) are shared across feature, UI, and render layers; changes must be coordinated across all consumers.
- The ship-assembly pipeline spans content → geometry → rendering → UI → persistence → validators; a change in one layer usually needs matching changes in the others.
- Any change to save data or blueprint shape is a versioned compatibility change: add/update a migration in `src/persistence/migrations/`, and verify both load and export paths. `migrateSave` must keep supporting legacy and modern inputs.
- Some modules rely on import-time registration side effects — preserve import order.
- `src/main.js` imports most CSS globally, so visual regressions often come from cross-screen cascade effects, not the file you edited.

## Per-Directory Instructions

`AGENTS.md` files carry layer-specific rules and pitfalls — read the one for the layer you're editing. They exist at the root, in `scripts/` and `docs/`, and in every `src/` layer folder (`src/`, `src/app/`, `src/core/`, `src/runtime/`, `src/legacy/`, `src/input/`, `src/audio/`, `src/features/`, `src/content/`, `src/render/`, `src/persistence/`, `src/styles/`, `src/ui/`), plus the ship-assembly subfolders of `src/content/`, `src/features/`, `src/render/`, and `src/ui/`.

## Design Docs (source of truth for intent)

- `docs/superpowers/plans/2026-07-10-voidreaper-master-plan.md`
- `docs/superpowers/specs/voidreaper-master-spezifikation.md`
- `docs/superpowers/plans/2026-07-10-adaptive-ship-assembly-master.md`
- `docs/manual-validation/adaptive-ship-assembly.md`

Plan docs may describe target-state architecture ahead of implementation; treat code plus validators as current behavior and plans as intent.
