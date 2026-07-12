# Codebase Review Findings — Round 2

Date: 2026-07-12
Scope: Full repository — `src/` (app, core, runtime, features, content, render, persistence, ui, legacy, input, audio), `scripts/` validators, and `tests/`. This is a follow-up to `docs/codebase-review-findings.md` (merged via PR #32/#33) and deep-dives the layers that review only covered lightly (`features`, `ui`, `legacy`, `input`, `audio`).

Methodology: four parallel deep-review passes (features / UI+legacy+input+audio / app+core+runtime+persistence / render+content+validators), each verifying claims against the actual source; key high-severity claims were independently re-verified afterwards. `npm test` (129/129), `npm run validate-content`, and `npm run validate:assembly` all pass; `npm run build` passes after `npm install`. Notably, **all gates stay green despite every finding below** — several findings are precisely validator/test blind spots.

Marking: findings labeled **latent** live in code that is not yet wired into `bootstrap.js` (plan-ahead features) — real defects, not yet player-reachable. Findings labeled **possible** could not be fully confirmed end-to-end.

---

## Status of prior findings (docs/codebase-review-findings.md)

| # | Prior finding | Status |
|---|---|---|
| 1 | `mergeDefaults` array-shape data loss | **Fixed** — unconditionally converts arrays |
| 2 | Prototype vault bypasses load-before-write save pattern | **Not fixed** — `src/app/bootstrap.js:424` still uses `services.save.save(metaSave)` in `onFavorite`/`onDismantle`; these remain the only raw `save()` call sites in `src/` |
| 3 | Missing migration tests | **Fixed** — added regression tests for v5 and v6+ array paths |
| 4 | Blueprint backfill guard misses corrupted v5 saves | **Not fixed** — guard at `src/persistence/migrations/ship-assembly-migration.js:2` unchanged |
| 5 | Dense one-liner blocks in `bootstrap.js`/`game-controller.js` | **Not fixed** — `bootstrap.js:154` is still a ~5,000-character line; `game-controller.js:63-74` unchanged |
| 6 | No coverage for legacy-runtime/audio/input | **Not fixed** — `tests/` still has zero references to these modules |

---

## High severity

### 1. [FIXED] Array-shaped save fields at current/newer save versions are still silently wiped
**Files:** `src/persistence/migrations.js` (array guard), `tests/features/persistence/migrations.test.js`

**Fix:** Removed the `originalVersion < CURRENT_SAVE_VERSION` guard so `byId()` runs unconditionally. Added regression tests for v5 and v6+ saves.

### 2. [FIXED] Overheat can never trigger

**File:** `src/features/heat/heat-system.js:20-24` (`add`), `:40` (overheat check)

`add()` raises `state.value` without any clamp or threshold check. `update()` captures `previous = state.value` at its top and then only ever *decreases* value (cooling). The overheat condition `state.value >= 100 && previous < 100` is therefore unsatisfiable: by the time `update()` runs, `previous` already includes the heat added by `add()`.

**Historical Failure scenario:** `addRunHeat(run, 100 - run.heat.value, "architect-overload")` (`src/features/encounters/architect-controller.js:8`) or anomaly heat pushed value to 100; the next `services.heat.update(...)` (`src/app/game-controller.js:92`) saw `previous >= 100` → no `overheated` event, no module disable, ever. The `disableCounts` escalation and `sourceHeat.clear()` in `overheat()` were dead code. **Fixed** by explicitly tracking the overheat threshold crossing within `add()` using a `crossedOverheat` flag.

Related (same file, `:35-38`): the heat-warning projection was dimensionally wrong — `projectedSeconds = (100 - value) / max(0.01, generationMultiplier - coolingRate)` subtracted a heat-per-second rate from a unitless multiplier. With the live call (`generationMultiplier` 1, `coolingRate` 10) the denominator clamped to 0.01 → projected ≈ 1500 s → the `heat-warning` event never fired. **Fixed**: the system now simply emits the `heat-warning` event with a fixed 1.0 second duration whenever heat exceeds 85 and the system is actively adding heat (`state.coolingDelay > 0`).

### 3. [FIXED] String `variantSeed` produces NaN and silently disables module detail rendering and damage overlays

**Files:** `src/features/ship-assembly/content/module-assembly-resolver.js:6` (`variantSeed: definition.id`), `src/render/ship-assembly/module-core-renderers.js:7` (`seedCount`), `src/features/ship-assembly/geometry/path-primitives.js:12`, `src/render/ship-assembly/damage-overlay-renderer.js:2`, activity-animation renderer

All 152 equipment profiles get `variantSeed = definition.id` (a **string**; zero definitions carry an explicit `assembly` block). Every numeric-seed render path computes NaN (`Math.abs("splitter-matrix") % 2 → NaN`), which the canvas API swallows silently:

- `seedCount()` returns NaN → detail loops (`for (i = 0; i < NaN; i++)`) never run → weapon coil rings, missile bays, mine spheres, cooling fins, and utility pods never render on any mounted module.
- `core-sensor-lens` and `core-corrupted-organ` draw nothing (NaN ellipse/polygon coordinates are spec-mandated no-ops).
- `traceBrokenPlateEdge` skips all `lineTo` calls → the damage overlay's broken edge and ember particles never appear on damaged modules.
- The activity-pulse renderer sets `globalAlpha = NaN` (ignored) → activity glow alpha inherits whatever the previous draw set — non-deterministic.

**Validator blind spot:** `scripts/validate-ship-assembly-content.mjs` checks `mass`/`damage` finiteness but never `variantSeed` type, so the entire greeble layer ships invisible with all gates green. Fix: hash the id to a number in the resolver (or in one shared `seedOf()` helper) and add a finiteness check to the validator.

### 4. [FIXED] Global keydown handler swallows typing in all text inputs

**File:** `src/input/input-controller.js:9-16`; compounded by `src/legacy/legacy-runtime.js:225`

`onKeyDown` looks up `resolvedBindings[event.code]` and unconditionally calls `event.preventDefault()` with no `event.target` check. The controller is started once in `bootstrap.js` and never stopped, including in menus.

**Failure scenario:** In the Codex filter input, prototype-vault filters, settings binding fields, or the blueprint import textarea, typing `w/a/s/d/q/e/p`, Space, or using arrow keys inserts nothing — the keydown is cancelled. The legacy runtime's window-level handler additionally blocks Space from activating the focused level-up card button (only Enter works). Fix: bail out when `event.target` is an editable element (`input`, `textarea`, `select`, `isContentEditable`).

### 5. [FIXED] Escape during quick-mount both defers the module and opens the pause screen

**Files:** `src/legacy/legacy-runtime.js:223-224`, quick-mount wiring in `src/app/game-controller.js:74` / `bootstrap.js:479`

The legacy `Input.init` keydown pauses on Escape/KeyP whenever `Game.state === "run"`. Quick-mount only pushes `timeScale = 0` without changing `Game.state`, so the modern handler defers the mount *and* the legacy window listener fires `Game.pause()` on the same keystroke — the pause screen opens on top of combat. `preventDefault()` in the modern handler cannot stop the second window-level listener.

### 6. [FIXED] Shared `qbuf` is clobbered while callers are iterating it (Reaper evolution)

**File:** `src/legacy/legacy-runtime.js:710-711` (re-query inside `damageEnemy`), callers at `:1071` (orbital blades), `:1096` (zone DoT), `:1235` (player bullets)

`damageEnemy` with `player.evoReaper` on a crit calls `this.hash.query(e.x, e.y, R, this.qbuf)`, which truncates and refills the shared buffer. But `damageEnemy` is called from inside `for (const e of this.qbuf)` loops; the outer iterator then walks the *new* contents.

**Failure scenario:** Player has the Reaper evolution plus orbitals/zones; an orbital crit triggers the reaper AoE mid-loop, and the outer loop continues over enemies from the reaper query — arbitrary double-hits or missed hits on every crit. Fix: use a dedicated buffer (or a local array) for the reaper query.

### 7. [FIXED] Module-scope singleton combat controllers leak state across runs (latent)
**Files:** `src/features/combat/drone-controller.js`, `mine-controller.js`, `nanite-controller.js`, instantiated at import time by `src/content/weapons/drone-core.js:4`, `mine-layer.js:4`, `nanite-swarm.js:4`

**Fix:** Controllers are now created per equip in each adapter's `createState()` (called with a fresh per-run context by `weapon-controller.equip`) and stored on the weapon state instead of at module scope, so drone budget, mine list, and nanite infections reset with every run. The drone controller additionally keeps `run.summons` in sync in both directions: `destroy(context, id)` also splices the drone out of `run.summons`, and `update()` drops drones that were removed externally (e.g. by the sacrifice cost in `active-module-system.js`). Regression tests in `tests/features/combat-controller-run-isolation.test.js`.

The controllers hold per-run state (`drones`, `mines`, `infections`) but are created once per page load:

- Drone budget (4) fills in run 1; `spawn()` returns null forever after, and old drone objects keep being position-updated against the new run's player while remaining in the *old* run's `summons`.
- `destroy(id)` removes from the internal array but never from `context.run.summons`; conversely `active-module-system.js:35` (sacrifice) splices `context.summons` without informing the controller — the two lists desync in both directions.
- Nanite `infections` keyed by enemy id persist across runs; `onKilled` chain-spread uses whichever run is currently active.

Latent because `createWeaponController` is not yet wired into bootstrap, but the adapters are registered content — this will bite the moment the system is switched on. Fix: per-run controller factories.

---

## Medium severity

### Persistence / app wiring

**M1. [FIXED] `writeAtomic` is not atomic and can permanently strand a duplicate save** — `src/persistence/save-store.js:45-52`. The pending key is written first, but `load()` never reads or cleans `${SAVE_KEY}-pending`, so the scheme provides zero recovery while doubling peak localStorage footprint per write. If the main `set` throws (quota), the pending copy is stranded forever; the `{get,set}` adapter without `delete` (`:17-19`) makes `remove` a no-op, so a duplicate persists even on success. With `thumbnailDataUrl` blobs and `migrationBackups` embedding full prior saves, quota exhaustion is realistic.

**Fix:** Dropped the write-ahead pending key entirely — a single-key `setItem` is already atomic (it either replaces the value or throws and leaves the old one intact), so the pending copy only doubled peak footprint. `load()` now recovers a pending key stranded by earlier builds once (using it as the save if the main key is missing) and removes it; the `{get,set}` adapter's `remove` falls back to overwriting with `""` when `delete` is absent. Tests in `tests/features/persistence/save-store.test.js`.

**M2. [FIXED] Campaign checkpoints don't capture combat-run state (possible)** — checkpoints are always serialized from `previewRun` (`bootstrap.js:129-132`, `:339`, `:443-444`), but combat nodes run in a **separate** run created by `game-controller.js:54`; nothing syncs assembly/inventory back into `previewRun` before `writeCurrentCheckpoint`. On resume, `attachLegacy` sees `!run.assembly` and rebuilds a default frame with only the starter railgun — mounted modules and run items are lost across a browser restart mid-campaign.

**Fix:** `adoptCombatRunState(previewRun, combatRun)` in `src/app/click-path-flows.js` pulls assembly, inventory, pending assembly items, heat, corruption, and the active blueprint ids from the combat run into the preview run; the `game.startWave` campaign hook calls it before `writeCurrentCheckpoint`. It is a no-op after a checkpoint resume, where both runs are the same object. Round-trip test in `tests/app/click-path-flows.test.js`.

**M3. [FIXED] Checkpoints are never cleared (possible)** — `src/features/checkpoints/checkpoint-service.js:83` defines `clear(...)` with zero callers. After a death or campaign completion, the last checkpoint remains in the save, so "Resume" indefinitely offers re-entry into the pre-death state — a free death-undo in a roguelite.

**Fix:** `bootstrap.js` now wraps `game.gameOver` (next to the existing `reset`/`startWave` wrappers): dying inside a campaign node clears the in-memory checkpoint, the preview run, and the pending resume state, calls `services.checkpoints.clear("player-death")`, and re-renders the hangar so "Fortsetzen" disappears. Non-campaign deaths (daily runs, salvage missions) leave the checkpoint untouched.

**M4. [FIXED] Save-write failures are silent in UI handlers** — `save-store.js:34-38` rejections propagate to `await services.save.update(...)` calls in async DOM handlers with no try/catch (`bootstrap.js:396, 402, 424, 425, 428`). On a quota error the purchase/favorite appears applied in-memory but is never persisted; the only trace is an unhandled-rejection console entry.

**Fix:** Centralized in the store: `save()`/`update()` route through a `persist()` wrapper that calls `onWarning` ("Speichern fehlgeschlagen …", surfaced as a toast via the existing bootstrap wiring) before rethrowing, so every current and future call site reports failures to the player. The fire-and-forget checkpoint writes in `bootstrap.js` now `.catch(() => {})` so the campaign flow continues after the warning, and a failed write during legacy-save migration no longer discards the migrated data (it is returned anyway instead of falling through to the corrupt-save path).

### Features

**M5. [FIXED] Affix lock is ignored by reroll** — `src/features/workshop/workshop-service.js:23-24`. `lock` sets `lockedAffixId` and its preview promises "Affix bleibt bei Rerolls erhalten", but `reroll` replaces `target.affixes` wholesale. Lock → reroll destroys the locked affix the player paid to protect.

**Fix:** `reroll` now keeps the affix whose id matches `lockedAffixId` in front of the freshly rolled set (matching on `affixId ?? id`), so lock → reroll preserves the protected affix.

**M6. [FIXED] Workshop-opened sockets can never be filled** — `workshop-service.js:25` pushes `null` into `target.sockets`, but `src/features/equipment/socket-service.js:6` rejects falsy sockets (`if (!item.sockets?.[socketIndex]) throw`). The player spends 2 AP to open a socket that can never accept a chip. Should push `{ chipId: null }`.

**Fix:** The socket action pushes `{ chipId: null }`, which `socket-service.insert` accepts.

**M7. [FIXED] Merchant services are mispriced and inert** — `src/features/merchant/merchant-service.js:6,16,28`. `merchantPrice` never reads `basePrice` from `MERCHANT_SERVICES` (content says `stabilize` costs 3 flux; the computed price is ~22+, unaffordable with the 6 starting flux). And `buy()` pushes non-corrupted services like "Hull-Reparatur" into `run.inventory` as items — no repair happens. Related (possible): the `CORRUPT_OFFER` buy path adds +15 corruption but grants nothing in return (`:26-28`).

**Fix:** `merchantPrice` returns the content `basePrice` for service offers (stabilize really costs 3 flux). Services are flagged `service: true` in content and `buy()` applies their effect instead of pushing an inventory item: repair restores hull to max, stabilize removes 10 run corruption via the corruption system, reveal raises node information levels. `CORRUPT_OFFER` now declares `grants: { scrap: 40, flux: 2 }` which `buy()` credits alongside the +15 corruption.

**M8. [FIXED] Hit-zone broadphase AABB truncates capsules (latent)** — `src/features/ship-assembly/damage/hit-zone-index.js:1`. `boundsFor` uses `radius ?? outerRadius ?? length/2`; capsules define *both* radius and length, so a Bastion core capsule spanning ±43 along its axis is indexed as ±20 — projectiles crossing capsule ends miss silently. Related schema inconsistency: the frame core zone uses key `shape: "capsule"` while module zones use `kind: "capsule"` (`hit-zone-builder.js:2`) — narrowphase code keyed on `.kind` won't recognize the core zone.

**Fix:** `boundsFor` uses `length/2 + radius` for capsules (both axes, orientation-agnostic) and the farthest vertex for polygons. `buildAssemblyHitZones` normalizes the frame `coreHitZone`'s legacy `shape:` key to `kind:` so narrowphase code sees one schema. Regression test covers a Bastion-sized capsule at |x| = 40.

**M9. [FIXED] Saved blueprints can never match placement targets in a later run (possible)** — `src/features/ship-assembly/blueprints/blueprint-matcher.js:3`. `findBlueprintTarget` matches on `parentBlueprintNodeId === port.parentNodeId || node.parentPortKey === port.key`, but blueprint nodes store the *original run's* node ids and `toBlueprintNode` never writes `parentPortKey`. In a new run both clauses are always false → `blueprintMatch` is always 0 and blueprint-guided quick-mount is a cross-session no-op.

**Fix:** `toBlueprintNode(node, portsById)` records the frame-stable `parentPortKey` (looked up from the node's `parentPortId`); both blueprint-service call sites pass the snapshot's `portsById`. `findBlueprintTarget`'s existing `node.parentPortKey === port.key` clause now matches in later runs. Blueprints saved before this change still lack the key and keep matching 0 — acceptable since blueprint-guided quick-mount never worked for them anyway.

**M10. [FIXED] Blueprint validation passes unknown ship frames** — `blueprint-validator.js:100-104`. `unknown-frame` is recorded as an issue but `valid` stays true; an imported blueprint with a bogus `shipFrameId` validates, then `assembly-geometry-service.js:19` throws `Unknown ship frame geometry` downstream.

**Fix:** `valid` is now false when `shipFrameId` is not in `knownShipFrameIds`, so bogus imports are rejected before the geometry service throws.

**M11. [FIXED] Trigger budget never resets (latent)** — `src/features/triggers/trigger-engine.js:15,48`. `stepEffects` is cumulative and only reset by `beginStep()`, which nothing calls. After 100 trigger effects in a session, every subsequent trigger is discarded forever.

**Fix:** `game-controller.syncLegacy` calls `services.triggers.beginStep()` once per simulation step, resetting the chain budget each frame.

**M12. [FIXED] `corruption` vs `corruptionLevel` field mismatch** — `src/features/equipment/item-factory.js:9` creates items with `corruptionLevel`; `prototype-loss-service.js:7` and `salvage-mission-service.js:7` read `item.corruption` (so the "corrupted epic → wreck signal" path never fires for factory items); `workshop-service.js:26-27` writes a third parallel `corruption` field while `corruptionLevel` stays untouched.

**Fix:** Canonical instance field is `corruptionLevel` (item-factory's). Workshop stabilize/corrupt and the reroll context now read/write `corruptionLevel` (falling back to legacy `corruption`), and `prototype-loss-service` / `salvage-mission-service` read `corruptionLevel ?? corruption`. Definition-level `corruption` on content stays untouched.

**M13. [FIXED] Fault scheduler excludes components without `disabledUntil` (latent)** — `src/features/faults/fault-scheduler.js:39`. `component.disabledUntil <= now` is false for `undefined`, so components that never carried the field are filtered out and faults always fall back to the generic `{id: "system"}` profile.

**Fix:** The candidate filter uses `(component.disabledUntil ?? 0) <= now`, so components that never carried the field are eligible fault targets.

**M14. [FIXED] Architect overload desyncs energy tier (latent)** — `src/features/encounters/architect-controller.js:8` sets `run.player.energy.ratio` directly without `energySystem.recalculate`, so `energy.tier` still reads "stable" while ratio is 1.5 (critical); every `LOAD_MODIFIERS[tier]` consumer sees the wrong tier. It also relies on the overheat path broken in High #2.

**Fix:** The overload choice raises `reserved` to 1.5× capacity through `energySystem.recalculate` (with a local `calculateLoad` fallback), so ratio and tier move together and `load-changed` fires.

**M15. [FIXED] Reactor emits a fake `corruption-changed` event (latent)** — `src/features/equipment/reactor-service.js:13` emits the event for abyssal-heart without calling the corruption system: state never changes, and the payload lacks the `previous`/`value` fields the real event carries (`corruption-system.js:24`) — HUD listeners would render a phantom change.

**Fix:** `enterSector` for abyssal-heart calls `changeRunCorruption(context.run, 5, ...)` — state actually changes and the real `corruption-changed` event (with `previous`/`value`) reaches listeners.

**M16. [FIXED] Dismantled modules pollute the detached-items ledger** — `src/features/ship-assembly/model/assembly-service.js:73,89`. `detachNode` always records `damageState: "detached"` into `state.detachedItems`, including when called from `dismantleNode` — any "remount detached" repair flow will list deliberate dismantles as combat damage.

**Fix:** `detachNode` takes `recordDetached` (default true); `dismantleNode` passes false, so deliberate dismantles no longer appear in the remount-detached repair ledger while combat detaches still do.

**M17. [FIXED] Placement score scale mismatch (possible)** — `placement-suggestion-service.js:19`. `previewPlacement` returns `lateralImbalance` as an absolute coordinate (tens of units) subtracted raw against otherwise 0–1 metrics, so this one term dominates suggestion ranking. Also `explainPlacement` reads `delta.rotationalInertia`, which `previewPlacement` never returns — dead branch.

**Fix:** The suggestion service normalizes `massAsymmetry` to `min(1, |lateralImbalance| / 60)` so it scores on the same 0–1 scale as the other metrics, and `previewPlacement` now returns a relative `rotationalInertia` delta so `explainPlacement`'s "Erhöht Trägheit" branch is live.

**M18. [FIXED] Daily-mode `run.seed` doesn't match the RNG actually used** — `sectors/daily-run-service.js:7` overwrites `run.seed` with a different hash than the one that seeded `run.rng` (`game-controller.js:54` + `legacy-runtime.js:421`). Dailies stay fair (both are date-stable), but build history, build codes, and records store a seed that does not reproduce the run.

**Fix:** `daily.apply` reseeds `run.rng` from the normalized daily `config.seed` and sets `run.seed` to the same value, so recorded seeds (build history, codes, records) reproduce the run.

### UI / input

**M19. [FIXED] OVERDRIVE event restore erases fire-rate upgrades taken during the event** — `src/legacy/legacy-runtime.js:574,579`. `triggerEvent` saves `p.fireRate` and `endEvent` restores it; picking "Overclock" (`fireRate *= 0.85`) during the 8-second frenzy is silently reverted while still consuming one of the max-8 stack.

**M20. Stale validated blueprint can be imported after the textarea is edited** — `src/ui/ship-assembly/blueprint-import-dialog.js:9`. `result` is set on PRÜFEN and the import button stays enabled with no `input` listener to invalidate it: paste code A, validate, replace with code B, import → blueprint A is imported.

**M21. Key rebinding stores raw typed text, not a `KeyboardEvent.code`** — `src/ui/screens/settings-screen.js:6` + `bootstrap.js:428`. Typing `f` into the Dodge field deletes the Space binding and registers `"f"`, which never matches `event.code` (`"KeyF"`). Dodge stops working immediately and the broken binding is persisted. Needs a keydown-capture UI or code-format validation.

**M22. Import-time DOM queries with no null guards** — `src/legacy/legacy-runtime.js:120-121, 219`. `cv`/`cx`/`Input.el` are resolved at module import; any consumer importing this module without the game DOM (tests, future screen split) throws at import time.

**M23. Assembly canvas pan-drag can get stuck on touch** — `src/ui/ship-assembly/assembly-canvas-controller.js:1`. No `pointercancel` handler and no `pointerId` filtering: a browser-cancelled touch drag leaves `pointer` set, so subsequent moves pan the camera with no button held; a second finger causes pan jumps.

### Content / validator blind spots

**M24. [FIXED] Campaign paths reference nonexistent boss IDs** — `src/content/campaigns/campaign-paths.js:3-5` names `furnace-sovereign`, `grave-collector`, `null-architect`, none of which exist anywhere in the repo. Neither validator checks campaign cross-references. Related: `campaign-path-service.js` only writes `save.selectedCampaignPath`; `sector-map-generator.js:4,25` hardcodes its own region order and never reads the path — the "Furnace Path" research unlock is purchasable today and changes nothing.

**M25. [FIXED] 141 non-evolution effect IDs have no handler, and the validator can't tell** — `scripts/validate-content.mjs:19-20` only validates *evolution* effects against handlers. Effects on ships/reactors/modules/weapons (e.g. `reactor-furnace-heart`) resolve to `console.warn("Unknown effect id")` + no-op. The content effects are also plain strings while `CORE_EFFECT_HANDLERS` execution spreads them as objects (`active-module-system.js:39`) — spreading a string produces char-indexed garbage. A genuinely misspelled effect on any non-evolution item would ship green.

**M26. [FIXED] ~110 `unlockSource: "research"` items are granted by no research node** — the tree (`src/content/research/research-tree.js`) has 15 nodes unlocking ~20 IDs; the rest render locked with the hint "Im Forschungsnetz freischalten" that can never be fulfilled (`unlock-service.js:7`, `loadout-service.js:35`). Neither validator checks reachability.

**M27. [FIXED] Blueprint thumbnail cache can serve the wrong ship's thumbnail** — `src/features/ship-assembly/blueprints/blueprint-thumbnail-service.js:3`. Cache key is `${shipFrameId}:${revision}:${size}`, but `structuralRevision` restarts at 0 per assembly while the cache Map lives for the whole app session: two different Vesper builds at the same revision collide, and the wrong `thumbnailDataUrl` is persisted into the save.

**M28. [FIXED] Cross-catalog duplicate IDs would ship undetected** — `validate-content.mjs:18` detects per-catalog duplicates but the union `Set` silently merges cross-catalog collisions, despite CLAUDE.md's global-uniqueness contract (no collision exists today — verified). Research prerequisites are also never validated against node IDs and have no cycle check.

---

## Low severity

### Persistence / core

- **Migration backups permanently inflate the save** — `migrations.js:52-53` embeds the full prior save (including its own backups, checkpoint, and thumbnails) with no pruning; each version bump roughly doubles save size, compounding the quota risk in M1.
- **`migrateSave` mutates its input for below-current versions** — `migrations.js:9,54`; `mergeDefaults` shares top-level references, so history/backups are written into the caller's object. Benign today, latent shared-snapshot footgun.
- **Event-bus: listeners (un)registered during emit run within the same emit** — `src/core/event-bus.js:11-18` iterates the live Set. No current listener does this; hazard only. (No listener leaks found — all per-run subscribers are correctly destroyed in `attachLegacy`.)
- **Registry freeze is shallow** — `src/core/registry.js:9`; nested objects (`assembly`, `tags`, `childPorts`) remain mutable and shared globally. Any in-place decoration silently changes content for all subsequent runs.
- **`createRuntimeId` can collide across page loads** — `src/core/ids.js:1-6`; per-load counter reset makes same-millisecond ids from different sessions identical. Practically negligible.
- **`encodeCollections` has no cycle guard** — `checkpoint-service.js:6-13` (unlike `deriveIdCounter`); a cyclic run object stack-overflows checkpoint writes. Current run shape appears acyclic.

### Features

- **`abyss-controller.js:6`** sets `run.corruption.maximum = Infinity` with no reader anywhere; the real uncapping is the `allowAbyss` flag. Dead/misleading field.
- **`economy/reward-balancer.js`** — `balanceMetaRewards`/`duplicateFragments` have zero callers; if wired as-is, the `earlyWeaponProgress` key would make `metaCurrencyService.transact` throw `Unknown currency`.
- **`daily-run-service.js:8`** — uncalled `record()` writes objects into `save.legacy.dailyBest[date]` where the legacy runtime stores plain numbers (`legacy-runtime.js:976-978`) — shape conflict when wired.
- **`merchant-service.js:34`** — `reroll(seed+1)` always regenerates the identical "rerolled" set (same cache key), can collide with a sibling node's seed, and rerolls are free.
- **`codex-service.js:7`** — first discovery (evidence 1) maps to `DISCOVERY_LEVELS[floor(1/2)] = "unknown"`, so it stays invisible as "Unbekannte Signatur". Possible off-by-one (`floor` vs `ceil`).
- **`build-history-service.js:3`** — `id: build-${Date.now()}` collides for same-millisecond captures, silently overwriting an entry.
- **`flight-profile-service.js`** — the `DAMAGE_CHANGED` subscription is a no-op (damage doesn't bump `structuralRevision`, so `rebuild` early-returns), plus a dead `damageState !== "detached"` filter.
- **`prototype-vault.js:10`** — `repair` sets `stability = "stable"` (string) while `item-factory.js` initializes `stability: 100` (number) and salvage writes `"damaged"/"corrupted"`; vault `filter` compares strictly across this mixed domain. Also `:6` reads `save.unlocks["vault-100"]`, which nothing grants and the validator whitelist stops at `vault-50`.
- **`extraction-service.js:8`** — `save.inventory[item.instanceId] ??= item` silently discards updated state when re-extracting an existing id.
- **`telemetry/run-telemetry.js:6`** — later distinct ≥85-heat episodes with lower maxima than the recorded peak never appear in `heatPeaks`.
- **`tag-engine.js:13`** — `provenance` is an expando on a Map; checkpoint Map encoding drops it. Currently masked by per-frame recompute.
- **`assembly-service.js:59`** — `addSecondaryConnection` passes a `{connectionId}` payload that `publish()` discards for `CHANGED` events.

### UI / input / audio

- **`src/ui/components/synergy-list.js:3-5`** — `entry.name`/`item.id`/`item.minimum` interpolated into `innerHTML` without `escapeHtml`; the only hole in an otherwise consistent escaping convention (data is static content today, so not exploitable, but one `<` in a content entry injects markup into the pause-screen inspector).
- **`src/audio/audio-system.js`** — the entire modern audio system is dead code (all live audio is legacy `AudioSys`), with latent bugs if wired: `setVolume()` before `unlock()` is lost, and `unlock()` never `resume()`s a suspended context.
- **`input-controller.js:17-20`** — no window blur/visibility reset for `held`; a key held while focus leaves the window (without hiding the tab) keeps `axis()` reporting movement. Legacy `Input.keys` has the same gap.
- **`touch-stick.js:35`** — `pointerup` resets on any pointer and a second `pointerdown` hijacks the origin. Latent: bootstrap never passes `stickElement`, so the modern stick is dead code and `stick.state` in `axis()` is always `{0,0}` — the live stick is the legacy one (which does check `pointerId`).
- **`codex-screen.js:8`, `prototype-vault-screen.js:8-11`** — filter inputs lose focus on every filter change (full `innerHTML` re-render, no focus restoration like `hangar-screen.js` does for tabs).
- **`legacy-runtime.js:30`** — `REDUCED` is snapshotted at import; the in-game "Reduced Motion" setting (and even OS-level changes mid-session) never reach legacy screen shake/glitch effects.
- **`bootstrap.js:280-306` (possible)** — leaving the workbench via a hangar tab skips `workbench.close()`; the session/state machine stays open. No user-visible symptom confirmed.
- **Unwired screens (informational)** — `run-summary-screen.js`, `sector-summary-screen.js`, `abyss-transition-screen.js`, `extraction-screen.js`, `difficulty-selector.js`, `item-comparison.js`, `assembly-touch-controls.js`, and `renderBuildHistory` are referenced only by tests; their contracts are unverified against any live producer.

### Render / content

- **`src/content/sectors/regions.js:2-6`** — every region's `enemies` list is consumed nowhere (spawning uses legacy `ETYPES`); if these IDs were ever spawned, all ten would hit the fallback visual profile. Dead content masking a real content→render gap.
- **Tags `Multishot`, `Dodge`, `Hull`, `Codex`** are used on items but absent from `TAG_DEFINITIONS` → `console.warn` per collect; `Aura` is defined but unused. Validator never checks tag references.
- **`ship-frame-assembly-profiles.js:17-26`** — every frame declares `lightPattern`/`connectorFamily` styles that no renderer reads; all 10 frames render connectors/lights identically.
- **`onboarding-steps.js`** — several unlock flags are written but read nowhere, and no validator covers onboarding unlock IDs (a typo in `vesper`/`railgun`/`bastion` would soft-lock starter gear and ship green).
- **`src/render/post/light-mask.js:25-28` (possible)** — a light missing `radius` produces NaN that passes the cull test and reaches `createRadialGradient(..., NaN)`, which throws — one malformed light kills the frame's mask pass. Similarly `combat-fx-stage.js:164` yields `alpha = NaN` for `maxLife` 0 (defensive gap only).
- **`region-world-renderer.js:52,104` (possible)** — `globalAlpha` reset to 1 absolutely rather than restored; stomps any future fade-in wrapper. Same pattern in `core-renderer.js:20`.
- **`static-layer-cache.js:30-32` (possible)** — bake cache keyed on snapshot identity + lod; palette is captured at first bake. Safe today only because snapshots are frozen and rebuilt per structural change.

---

## Quality notes (non-defect)

- **Duplicated rarity→fragment tables** in `economy/reward-balancer.js:10` and `inventory/prototype-vault.js:12` (`{common: 2, rare: 5, epic: 12, legendary: 25, unique: 40}`) — extract one source of truth.
- **`inventory/run-inventory.js` is unused**; `game-controller.js:64` re-implements the same adapter inline. Two implementations of one contract will drift.
- **Unwired feature set** — weapon-controller, active-module-system, charge-system, encounter/boss/architect controllers, extraction, fault scheduler, prototype-loss, meta-currency, local-records, challenge-service, socket-service, and reactor-service have no bootstrap wiring and no test coverage; several carry the latent defects above and none are exercised by `npm test`.
- **Missing input validation** — `decodeBuildCode`/`decodeBlueprint` parse attacker-controlled base64 JSON with no shape validation of node numeric fields (`localPosition` etc.) before geometry math.
- **Merchant offer cache mutation** — `reserve()` mutates cached shared offer objects; revisiting a node sees mutated offers. If intended, deserves a comment, since `roll()` looks pure.

## Verified clean

- RNG determinism: `mulberry32`/`createRunRng` round-trips state correctly through checkpoint snapshot/restore; seed truncation is bit-consistent.
- Settings screen in-memory/persisted state stays consistent (in-place mutation + `update()`).
- Bootstrap init order and per-run service teardown chain in `attachLegacy` are complete for all subscribing services.
- Escaping discipline is otherwise consistent: save-derived strings go through `escapeHtml`, thumbnails through the strict `safeImageDataUrl` whitelist, legacy toasts/HUD via `textContent`.
- Legacy `Persist` is fully bridged to the save-store before `legacyRuntime.start()` — no dual-persistence race.
- All canvas `save`/`restore` pairs in `src/render` balance; all frame `armorFamily` values, region palettes, enemy visual profiles, and fault profile IDs resolve; no cross-catalog ID duplicates exist today.
- `npm test` 129/129; both content validators pass; production build succeeds.

## Suggested priorities

1. **High #1** (data loss, no backup) plus regression tests — smallest fix, worst failure mode.
2. **High #4/#5** (input handling) — most player-visible today, small fixes.
3. **High #2/#3** (heat, variantSeed) — whole subsystems silently inert; add validator checks alongside.
4. **High #6** and **M19** (legacy combat correctness).
5. Validator hardening (M24–M28) — cheap insurance for a content-heavy repo where all gates currently pass despite the above.
