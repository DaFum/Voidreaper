# Codebase Review Findings

Date: 2026-07-12
Scope: Full `src/` tree (app, core, runtime, features, content, render, persistence, ui, legacy, input, audio, styles) plus `scripts/` validators and `tests/`.

> **Coverage note:** `src/persistence/`, `src/content/`, and `src/render/` received a full deep pass (including running the actual validators and reproducing a bug). `src/app/`, `src/core/`, and `src/runtime/` received a direct manual pass over the primary wiring files. `src/features/`, `src/ui/`, `src/legacy/`, `src/input/`, `src/audio/`, `src/styles/`, and `tests/` received a lighter, best-effort pass — treat findings there as a starting point, not exhaustive, since automated deep-review agents for those areas were interrupted by an account usage-limit reset mid-run.

---

## High severity

### 1. Legacy/imported saves silently lose inventory, wreck signals, codex, and challenge progress
**File:** `src/persistence/migrations.js`, `mergeDefaults` (lines ~7-16) interacting with `migrateSave` (lines ~44-47)

`mergeDefaults` recurses into any input value that is a plain object default (`inventory`, `wreckSignals`, `codex`, `challenges` all default to `{}`). If the *input* value for one of these fields is still array-shaped (the legacy/pre-migration shape that `byId()` exists to convert), the recursion hits its `Array.isArray(value)` guard and replaces it with `clone(defaults)` — i.e. `{}` — before `byId()` ever runs. `migrateSave` then calls `byId(save.inventory)` etc., but the array is already gone, so `byId` has nothing left to convert.

Reproduced directly:
```js
migrateSave({ saveVersion: 3, inventory: [{id:'item-1',qty:2}], wreckSignals:[{id:'wreck-1'}], codex:[{id:'codex-1'}], challenges:[{id:'chal-1'}] })
// → all four fields come back as {}
```
This also fires for `saveVersion: 5` (current) with array-shaped fields — it is not gated behind the legacy-migration branch at all.

**Failure scenario:** Any legacy save, hand-edited/imported save, or a future/older client emitting array-shaped `inventory`/`wreckSignals`/`codex`/`challenges` silently loses all prototype-vault items, wreck signals, codex entries, and challenge progress on load, with no warning to the player. For a save below `CURRENT_SAVE_VERSION`, a pre-mutation backup is stored in `migrationBackups` (`migrations.js` only writes it inside `if (originalVersion < CURRENT_SAVE_VERSION)`), so the data isn't unrecoverable from disk there. But for a save already at the current version (`saveVersion: 5`) with array-shaped fields — the case this finding says triggers the same bug — that guard never fires, so no backup exists and the loss is unrecoverable through the normal load/save flow.

**Why it matters:** `src/persistence/AGENTS.md` and CLAUDE.md both state `migrateSave` must support both legacy and modern inputs — this currently breaks that guarantee for these four fields.

**Fix direction:** special-case arrays inside `mergeDefaults` for these known legacy-shaped fields (skip the recursive default-clone so `byId` can see the raw array), or run `byId()` on the raw input before `mergeDefaults` touches it.

---

## Medium severity

### 2. Prototype vault favorite/dismantle bypasses the load-before-write save pattern
**File:** `src/app/bootstrap.js`, `Prototypen` tab handler (~line 424)

Every other save mutation in `bootstrap.js` goes through `services.save.update(mutator)`, which reloads the save fresh from storage, clones it, applies the mutator, and writes — this is the pattern that keeps concurrent writers from clobbering each other (see `src/persistence/save-store.js`: `update()` vs. raw `save()`). The prototype vault's `onFavorite`/`onDismantle` handlers instead mutate the in-memory `metaSave` object directly and call `services.save.save(metaSave)`, which serializes and writes that object verbatim with no reload.

**Failure scenario:** With the game open in two browser tabs (or any other writer touching the save between this tab's last `load()` and this action), dismantling/favoriting a prototype item overwrites whatever the other writer just persisted (e.g. a research purchase, a blueprint save) with this tab's stale snapshot.

**Severity:** Medium — requires a multi-tab or concurrent-write scenario to trigger, but the failure mode (silent data loss of unrelated progress) matches the same class of bug as finding #1.

### 3. `mergeDefaults`/`migrateSave` gap is not caught by tests
Related to #1 — no test in `tests/` currently exercises `migrateSave` with array-shaped legacy `inventory`/`wreckSignals`/`codex`/`challenges` input, so this regression path has no safety net. Recommend adding a regression test alongside the fix.

---

## Low severity / possible / unverified

### 4. Ship-assembly blueprint backfill may not cover a corrupted zero-blueprint save at current version
**File:** `src/persistence/migrations/ship-assembly-migration.js` (~line 2)

The one-time blueprint-backfill guard is `fromVersion < 5 && !Object.keys(save.shipBlueprints).length`. A save already at `saveVersion === 5` whose `shipBlueprints` became empty through data corruption (not a legitimate player action) would never re-trigger the backfill, since the guard requires `fromVersion < 5`. Low confidence this is reachable in normal play; flagging as a gap rather than a confirmed bug.

### 5. `bootstrap.js` and `game-controller.js` contain extremely dense, minified-style one-liner blocks
**Files:** `src/app/bootstrap.js` line 154 (the `import.meta.env.DEV` debug-scenario block, a single ~5,000-character line), and `src/app/game-controller.js` lines 63-74 (`attachLegacy` body, packed onto a handful of very long lines).

This is a maintainability/code-quality issue rather than a functional bug: these blocks are effectively unreviewable line-by-line, any future edit is high-risk for silent mistakes (per CLAUDE.md's own warning that "contracts here are structural, not typed" and changes can break screens with no compile error), and diffs against them will be hard to read. Since `src/app/` is explicitly called out in CLAUDE.md as the highest-risk wiring layer, the density compounds that risk. Recommend reformatting (not behavior changes) as a follow-up, at least for the DEV-only debug block, which is safe to touch since it never ships to production builds.

### 6. No automated coverage found for `legacy-runtime.js`, `audio-system.js`, `input-controller.js`, `touch-stick.js`, or `action-bindings.js`
Spot-checked `tests/` for references to these modules and found none. This matches CLAUDE.md's characterization of `legacy-runtime.js` as hard to test in isolation, but the input/audio modules are smaller and more testable — worth considering targeted unit tests, particularly for `action-bindings.js` given it's a shared contract consumed by both `bootstrap.js` and the legacy runtime's `events.on("action", ...)` handler.

---

## Verified clean

- **`src/content/**`:** Both `npm run validate-content` and `npm run validate:assembly` pass against current content (10 ships, 10 weapons, 12 reactors, 120 modules, 24 chips catalog counts hold; 152 equipment profiles, 10 ship frames, 14 visual families, 11 enemy profiles, 5 region profiles). No ID collisions or unknown-reference errors. `src/content/migrations/legacy-meta-conversion.js` correctly guards against double-refunding via `migrationHistory` entries.
- **`src/render/**`:** No field-shape mismatches found between renderers (`enemy-visual-profiles.js`, `region-visual-profiles.js`, `forged-abyss/palettes.js`, `ship-assembly/module-core-renderers.js`, `ship-assembly/assembly-renderer.js`, `enemy-renderer.js`) and the content/feature data they consume.
- **`src/core/event-bus.js`:** Straightforward pub/sub with per-listener try/catch and unsubscribe support; no issues found.
- **`src/app/bootstrap.js` ↔ `src/legacy/legacy-runtime.js` hook wiring:** All five `configureX` hooks bootstrap calls (`configureEvolutionEffects`, `configureShipRenderer`, `configureEnvironmentRenderer`, `configureCombatFxRenderer`, `configurePlayerDamageRouter`) have matching definitions in `legacy-runtime.js`; no signature drift found.

---

## Suggested next steps

1. Fix finding #1 (data-loss bug) and add a regression test — this is the one concretely verified high-severity issue.
2. Audit other direct `services.save.save(...)` call sites (beyond the prototype vault) for the same stale-write pattern as finding #2.
3. If time allows, re-run a deeper pass over `src/features/`, `src/ui/`, and `src/legacy/` — those layers were only lightly reviewed here.
