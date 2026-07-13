# Voidreaper — Codebase Review

_Date: 2026-07-13 · Scope: full `src/` tree (317 modules) plus validators and build gate._

## Summary

The codebase is in good health. The release gate is green: **214/214 tests pass**, and all three
content validators pass (`validate-content`, `validate:assembly`, `validate:tutorial`). The security
posture is notably strong — every dynamic string interpolated into `innerHTML` is routed through a
central `escapeHtml`, and thumbnail data URLs are constrained by `safeImageDataUrl` (blocks
`javascript:` URIs). `save-store.js` is carefully hardened against corruption, quota, and private-mode
failures with layered recovery (main → pending → legacy → default).

This review found **2 High** (both now ✅ **fixed** — see resolution notes), **9 Medium**, and a longer tail
of **Low** issues, plus **1 open design question**. Every finding below was read and confirmed against the
actual code paths (line references verified). The dominant themes:

1. **Two silent data-loss / render-loss bugs** driven by ID and profile-resolution edge cases (H1, H2).
2. **The save-load path is all-or-nothing**: several unguarded dereferences in migrations turn
   slightly-off data into total progress loss (M1).
3. **Two combat controllers leak entities into shared run-state** because they don't re-sync the way
   the sibling controller does (M3).

---

## High

### H1 — Blueprint ID counter is never persisted, so saved blueprints are silently overwritten across sessions — ✅ FIXED
**`src/app/bootstrap.js:173`** (with `src/features/ship-assembly/blueprints/blueprint-service.js` `hydrate`, `src/core/ids.js:9`)

> **Resolution:** `createIdService` gained `restore(value)` and a `prefix` getter (`src/core/ids.js`). The
> blueprint service now writes `save.blueprintIdCounter = idFactory.snapshot()` on every persist and, on
> `hydrate`, restores the counter to `max(persisted, derived-from-existing-ids)` — the id-scan fallback lets
> pre-fix saves self-heal on first load. `blueprintIdCounter` was added to the save schema default
> (`save-schema.js`) and defaulted in the ship-assembly migration so it survives load/export. Verified: after
> a simulated reload the next minted id no longer collides with an existing one (see `scratchpad/verify.mjs`).


`createIdService("meta-blueprints")` is constructed with no `restoredCounter`, and `blueprints.hydrate()`
only reloads cached blueprints — it never restores the counter via `idFactory.snapshot()`. So the counter
restarts at `0` on every page load, regenerating `meta-blueprints-ship-blueprint-1`, `-2`, … . Because
`saveFromAssembly`/`duplicate`/`importBlueprint` persist via a plain key assignment
(`save.shipBlueprints[id] = blueprint`), the first new blueprint saved in a fresh session **overwrites**
the first blueprint saved in a previous session — silent, unrecoverable data loss.

This is clearly an oversight: the run-state ID system does the opposite correctly
(`checkpoint-service.js:56` serializes `idCounter: run.ids.snapshot()` and restores it on hydrate).
Blueprints get neither the snapshot nor the restore.

**Fix:** persist `blueprintIds.snapshot()` in the save and pass it back as `restoredCounter` on hydrate
(mirror the checkpoint pattern), or mint blueprint IDs with a collision-resistant scheme (`createRuntimeId`).

### H2 — One unknown/removed module `definitionId` permanently blanks the entire ship for the run — ✅ FIXED
**`src/features/ship-assembly/geometry/assembly-geometry-service.js:16` (`profileFor`) + `:26` (`guardedRebuild`)**

> **Resolution:** added a non-throwing `getAssemblyProfile(id)` to the equipment registry
> (`equipment-registry.js`, returns `null` for unknown ids) and switched `profileFor` to use it, so the
> existing `?? profileRegistry.getModuleProfile(...) ?? { rendererId, sizeClass }` fallback chain now actually
> runs. A stale node degrades to a placeholder profile (`buildModuleGeometry` already tolerates a minimal
> profile via `??` defaults) instead of throwing and poisoning `cache.revision`. `requireAssemblyProfile` is
> unchanged for callers that intentionally want the strict throw. Verified: `getAssemblyProfile(unknown)`
> returns `null` without throwing and the fallback placeholder is produced (see `scratchpad/verify.mjs`).


`profileFor` is written with a graceful-fallback chain:
`equipmentRegistry?.requireAssemblyProfile(node.definitionId) ?? profileRegistry?.getModuleProfile(...) ?? {...}`.
But `requireAssemblyProfile` calls `registry.require` (`core/registry.js:48`), which **throws** on an unknown
id — so the `??` fallbacks are dead code and never execute.

When a save or imported blueprint references a module id that was removed/renamed in a content update,
`profileFor` throws mid-rebuild. `guardedRebuild`'s error-boundary fallback sets `cache.revision = NaN`
(line 26). Since `NaN === snapshot.structuralRevision` is always false, **every** subsequent rebuild
re-enters the full path and re-throws. The ship is stuck on the initial bare-core snapshot for the whole
run: no modules render, and no module hit-zones exist (modules can never be hit or damaged).

**Fix:** make `profileFor` tolerant — use `equipmentRegistry.get(...)`/`has(...)` (non-throwing) so the
fallbacks actually run, and skip or placeholder unknown nodes instead of aborting the whole rebuild.

---

## Medium

### M1 — Migration path is all-or-nothing: unguarded dereferences turn minor data drift into total progress loss — ✅ FIXED
**`src/persistence/save-store.js:88-129`, `src/persistence/migrations.js:23,45-48`, `src/persistence/migrations/ship-assembly-migration.js:2`**

> **Resolution:** `byId` (`migrations.js`) now skips `null`/non-object elements instead of throwing on
> `entry.instanceId`, and preserves id-collision entries by suffixing the index rather than silently
> dropping them. The blueprint-normalization loop (`ship-assembly-migration.js`) now guards the blueprint
> value (`blueprint?.nodes ?? []`) so a `null` blueprint no longer throws. Both were the concrete triggers
> that funneled valid-but-slightly-off saves into the corrupt→default-reset path. Verified with a legacy
> array-format save containing a null element, duplicate ids, and a null blueprint (see `scratchpad/m1.mjs`).
> _(Note: making the load path recover partially rather than all-or-nothing remains a larger design change,
> out of scope for this fix.)_


`load()` wraps `migrateSave(current)` in the try that flags the save "corrupt"; on any throw it copies the
real save to a `-corrupt-*` key and returns `createDefaultSave()` — the player loses everything even though
their JSON was intact. Two un-guarded dereferences readily trigger this:

- `byId` (`migrations.js:23`) does `value.map(entry => [entry.instanceId ?? entry.id ?? …, entry])` over
  `inventory`/`wreckSignals`/`codex`/`challenges`; a single `null`/`undefined` element throws a TypeError.
  It also **silently drops** entries that collide on `instanceId` (`Object.fromEntries` keeps the last).
- `ship-assembly-migration.js:2` iterates `for (const node of blueprint.nodes ?? [])`; the `?? []` guards a
  missing `nodes` array but **not** a `null` blueprint value, which throws.

**Fix:** guard both loops against null/sparse elements; consider making migration resilient per-slice
(recover the readable parts) rather than resetting the whole profile on any throw.

### M2 — `merchant.sell()` awards credits without verifying the item is in the inventory (credit duplication) — ✅ FIXED
**`src/features/merchant/merchant-service.js:47`**

> **Resolution:** `sell()` now snapshots `run.inventory.length` before filtering and returns `false` without
> awarding if the length is unchanged (item was not present), otherwise awards and returns `true`. A repeated
> call with the same item reference — or any item never in the inventory — no longer mints scrap. No existing
> callers depend on the return value.


`sell(run, item)` filters the item out of `run.inventory`, then **unconditionally** calls
`currencyService.award(...)`. The filter is a no-op if the item is already gone, but the award still fires.
A double-click (or any repeated call with the same item reference) mints scrap twice while removing once;
passing an item never in the inventory mints free scrap.

**Fix:** award only when the filter actually removed an element (compare length, or find-then-remove).

### M3 — `mine-controller` leaks "ghost" mines into shared `run.zones` — ✅ FIXED
**`src/features/combat/mine-controller.js:5,10`**

> **Resolution:** added a `removeZone(run, mine)` helper that splices the mine out of `run.zones` by identity,
> and called it from both the capacity-shift path in `place()` and the `detonate()` loop. The local `mines`
> array and the shared `run.zones` now stay in sync (mirroring how `drone-controller` re-syncs `run.summons`).
> Verified: over-placing past capacity leaves no ghosts and detonation clears `run.zones` (see `scratchpad/m3.mjs`).


`place()` pushes each mine into both the local `mines` array and `context.run.zones`, but at capacity
`mines.shift()` (line 5) and on `detonate()` `mines.splice(0)` (line 10) remove the objects only from the
local array — never from `run.zones`. Stale mine objects accumulate in `run.zones` and keep being treated
as live zones (collision/render) for the whole run.

Contrast `drone-controller.js:12-15,28-30`, which explicitly re-syncs `run.summons` with its local list.
The mine controller is missing the equivalent cleanup.

**Fix:** remove the mine from `run.zones` in both the capacity-shift and detonate paths (splice by identity).

### M4 — Architect defeat event re-fires on every hit after health reaches 0 — ✅ FIXED
**`src/features/encounters/architect-controller.js:10`**

> **Resolution:** the state now carries a `defeated` flag (initialized in `start`), and `damage()` gates the
> `eternal-architect-defeated` emit on `!state.health && !state.defeated`, setting the flag on first defeat —
> matching the sibling `boss-controller`. Verified: the event fires exactly once even under repeated
> post-death hits/DoT ticks (see `scratchpad/m4.mjs`).


`damage()` emits `"eternal-architect-defeated"` whenever `!state.health`, with no one-shot guard. Any
subsequent hit or DoT tick after health hits 0 re-fires the final-boss defeat event, risking duplicate
end-of-run/reward sequences. The sibling `boss-controller.js:4` does this correctly with
`!state.health && !state.defeated`.

**Fix:** add a `defeated` flag to the architect state and gate the emit on it.

### M5 — Fault scheduler fires a scheduled fault even after pressure returns to zero — ✅ FIXED
**`src/features/faults/fault-scheduler.js:35-38`**

> **Resolution:** `update()` now re-checks pressure every tick: when `state.pressure <= 0` it resets
> `nextAt` to `Infinity`, clears `nextTier`, and returns `null` — cancelling a fault that was scheduled
> during an earlier overload. This also removes the path where `tierFor(0)` returned `"none"` and the tier
> lookup silently fell back to `profile.light`. Verified: after briefly overloading then returning to a fully
> stable state, no fault fires and the pending schedule is cleared (see `scratchpad/m5.mjs`).


Once a fault is scheduled (`nextAt` finite), the scheduler reschedules only when `nextAt` is `Infinity`,
so `schedule()`'s own `pressure <= 0 → Infinity` guard is bypassed. If the player briefly overloads then
returns to fully stable (pressure 0), the pending fault still fires; `tierFor(0)` returns `"none"`, and
`profile["none"]` is undefined, silently falling back to `profile.light`. It also can't move the event
earlier when pressure spikes between events.

**Fix:** re-evaluate `nextAt` when pressure drops to 0 (cancel the pending fault); handle the `"none"` tier
explicitly.

### M6 — Evolution level-up cards display a raw internal effect id as the description — ✅ FIXED
**`src/legacy/legacy-runtime.js:320` (rendered at `:1884`)**

> **Resolution:** added a German `description` field to each entry in `content/evolutions/legacy-evolutions.js`
> (derived from the actual effect handlers, e.g. Prism Lance → "Durchschlägt alle Gegner · +50% Projektiltempo"),
> and changed the card mapping to `ds: definition.description ?? definition.effects.join(" · ")` — so the
> localized copy renders, with the old effect-id join kept only as a fallback. Content validator and tests pass.


`ds: definition.effects.join(" · ")` uses the effect-handler id array (`["evolution-prism-lance"]`, …),
which is machine copy, not localized text. The card renders literal strings like `evolution-prism-lance`
in an otherwise German UI. (Escaped, so no XSS — purely a UX defect.)

**Fix:** add a `description` field to the evolution content and render that instead of the effect ids.

### M7 — Evolution unlock threshold is hardcoded to 3 and ignores the content's `minimum`
**`src/legacy/legacy-runtime.js:319,858`**

`req` is built by dropping the `minimum` field (`.map(r => r.id)`), and `rollOptions` gates with
`ev.req.every(r => (this.upgradeCounts[r] || 0) >= 3)`. Every `LEGACY_EVOLUTIONS` requirement specifies
`minimum: 1`, so evolutions require 3 stacks of each of two prerequisites (6 picks) instead of the declared
1 each (2 picks). Per CLAUDE.md code is authoritative over content, so the tuning may be intentional — but
the `minimum` field is silently dead, a real divergence between data and behavior.

**Fix:** honor `requirement.minimum` in the gate (or remove the field from content to end the divergence).

### M8 — Every module-damage event defeats the static-layer bake cache during live combat
**`src/features/ship-assembly/geometry/assembly-geometry-service.js:19` (damage fast-path) + `src/render/ship-assembly/static-layer-cache.js`**

On a damage-only change the fast path still does `lastCompleteSnapshot = snapshotFromCache()`, minting a
**new frozen snapshot object identity**. `getShipStaticLayers` keys its baked base+armor offscreen canvases
on snapshot identity via a `WeakMap`. Since the live combat ship is drawn through `renderPlayerShip`
(`bootstrap.js:424`), sustained combat re-bakes both static layers (full hull-path + armor plates) on every
hit — negating the cache the layer was built to provide.

**Fix:** preserve snapshot identity across damage-only updates, or key the static-layer cache on
`structuralRevision` rather than object identity.

### M9 — Placement preview footprint is 25–35% smaller than real geometry, so validated mounts overlap
**`src/features/ship-assembly/placement/collision-bounds.js:5` vs `src/features/ship-assembly/geometry/module-geometry-builders.js:298`**

`boundsFromCenter` uses half-extents S12/M18/L26/XL36, but real node bounds use
`extent = length/2 + radius ≈ size*1.275` (M≈23, L≈32, XL≈43). `compatibilityService.evaluate` checks
overlap with the undersized preview candidate and there is no post-mount recheck, so two medium modules on
adjacent ports both pass the overlap check and then render visibly clipped into each other or the core.

**Fix:** derive preview bounds from the same extent formula as real geometry (single source of truth).

---

## Low

### Persistence
- **`migrations.js:56-67`** — `migrationBackups` stores a full `clone(input)` per version bump and is never
  pruned; if the post-migration write keeps failing (quota/private mode), a new backup is appended on every
  load, inflating the payload and worsening the very quota problem that caused the failure.
- **`save-store.js:131-140`** — if `migrateSave` itself throws in `save()`/`update()` (via the M1
  dereferences on an in-memory save), the rejection propagates with no `onWarning` toast, violating the
  AGENTS.md "writes never fail silently" contract (only the quota path is wrapped).
- **`content/migrations/legacy-meta-conversion.js:3`** — legacy-shard refund is idempotent only while
  `migrationHistory` survives; `save.legacy.meta` is never cleared, so if history is ever lost/rebuilt the
  player is refunded `voidShards` a second time.
- **`persistence/migrations/tutorial-migration.js:11-17`** — for `fromVersion < 6`, any pre-existing
  `save.tutorial` is discarded and rebuilt from `legacyOnboarding`. Benign today (tutorial state arrived at
  v6) but a latent data-loss edge.

### Core / App
- **`main.js:13`** — `bootstrap()` is invoked with no `.catch`; any rejection in async startup
  (storage throw, lazy-chunk 404, migration throw) leaves the app half-initialized and dies with an
  unhandled rejection and no user-facing fallback.
- **`core/registry.js:18-26`** — `deepClone` (unlike the hardened sibling `deepFreeze`) has no visited-set
  cycle guard and coerces `Map`/`Set`/`Date` into plain objects; low risk since content is static, but a
  latent inconsistency in a core utility feeding every catalog.

### Combat / Features
- **`merchant-service.js:48`** — `reserve()` sets `offer.reserved = true` but `buy()` never checks it, and
  offers stay in `cache` after purchase, so "reserved"/one-time offers are re-buyable — the intent is
  silently unenforced (dead flag).
- **`combat/weapon-controller.js:12,28`** — `equipped.damage` is initialized to 0 and never incremented, so
  the `telemetry()` damage-dealt figure is always 0.
- **`corruption/corruption-system.js:16`** — `state.bookings` accumulates one frozen entry on every
  `change()` for the whole run and `summary()` rescans it each call; in long Abyss runs (per-second
  corruption) this is steady memory growth and O(n) summary cost.
- **`heat/heat-system.js:29,37`** — the overheat warning is gated on `coolingDelay > 0`, but `coolingDelay`
  is decremented by `dt` earlier in the same `update()`; a large `dt` (frame hitch) can drive it to 0 before
  the check so no `heat-warning` fires even at `value >= 85`.

### Legacy runtime / Render / Input
- **`legacy/legacy-runtime.js:485,1974`** — `AudioContext` is never `suspend()`-ed on pause or
  `visibilitychange`; the ambient drone oscillators keep running (CPU/battery) while paused or backgrounded.
- **`legacy/legacy-runtime.js:986-988`** — `glitch()` schedules an unmanaged 220 ms `setTimeout` per hit
  with no `clearTimeout`; rapid consecutive hits let an earlier timer clear the effect mid-sequence.
- **`legacy/legacy-runtime.js:1084-1085`** — the broad-phase spatial hash is built once from start-of-frame
  positions; enemies then move / are removed (`killEnemyQuiet`) without hash update, so bullet broad-phase
  can miss a fast crosser and separation can push against a just-detonated bomber's ghost (impact small).
- **`input/input-controller.js:18` + `bootstrap.js:832`** — the modern `pause` action is emitted but never
  consumed; pausing works only because the legacy keydown handler toggles it directly. Two `window` keydown
  listeners both `preventDefault` the same keys, and rebinding pause via `input.rebind` would be a no-op.
- **`render/canvas-renderer.js`** — dead module (never imported); if ever wired it would double-render to
  `#game` and its `resize` listener is only cleaned by an explicit `destroy()`.

### Ship-assembly (secondary)
- **`features/ship-assembly/flight/flight-profile-service.js` (`previewPlacement`)** — mass/balance preview
  uses `port.localPosition` (parent-relative) as if world coordinates, so nested-placement balance metrics
  and suggestion ranking are wrong; top-level placements happen to look fine and mask it.
- **`features/ship-assembly/damage/repair-service.js` (`apply`)** — repair mutates live node state outside
  `assemblyService.transaction` and deducts cost last; if the post-mutation invariant assertion throws, the
  node stays repaired with no rollback and no cost. Its inline `damageState` recompute also omits the
  `coreIntegrity <= 0 → "detached"` case that `resolveDamageState` enforces.
- **`features/ship-assembly/geometry/assembly-geometry-service.js` (`destroy`)** — `destroy()` removes the
  `CHANGED` subscription but does not cancel an already-scheduled rAF, so on run restart a pending rebuild
  from the previous service can emit `GEOMETRY_READY` on the shared bus (one-frame stale geometry).
- **`ui/ship-assembly/assembly-view-modes.js:11`** — relocated nodes (via `promoteSecondaryConnection` /
  `createEmergencyBrace`) have `parentPortId = null`, so the STRUCTURE overlay reads `portsById[null]` and
  always shows depth "T0" regardless of true branch depth.

### UI (accessibility / robustness)
- **`ui/components/modal-dialog.js:17`** — closing removes the host node but never restores focus to the
  opener, so keyboard focus drops to `<body>`.
- **`ui/screens/hangar-screen.js:17-18`** — tab strip uses `role="tab"`/`aria-selected` but the content
  region has no `role="tabpanel"`/`aria-labelledby` and no roving `tabindex`; announced as tabs but not
  usable as one.
- **`ui/components/tutorial-overlay.js:118-125`** — a `MutationObserver` on `document.body` (`subtree:true`)
  is registered for the app's whole lifetime (singleton, `destroy()` never called) and schedules `refresh()`
  on any DOM mutation, even with no active tutorial; bounded by rAF coalescing and an early return, and
  largely redundant with the per-frame `refresh()` at `bootstrap.js:837`.
- **`ui/screens/simulator-screen.js:6`, `ui/screens/run-summary-screen.js:2`** — omit the `if (!root) return`
  guard that sibling screens have before `root.innerHTML` (robustness only; not currently triggerable).
- **`ui/screens/extraction-screen.js:2`** — the parameter is named `window`, shadowing the global; harmless
  as written but a footgun for future edits.

---

## Open design question

### Progress objectives may double-count if `context.metrics.*` holds running totals
**`src/features/encounters/objective-schema.js` (`createProgressObjective.update`) + `objectives/*.js`**

`update` does `state.progress = min(target, state.progress + contribution(context, dt, state))`. Five
objectives feed `contribution` a metric that reads like a **cumulative total** rather than a per-tick delta:
`close-rifts` (`riftsClosed`), `salvage-rush` (`salvageCollected`), `hunt-warper` (`warpersKilled`),
`eliminate-target` (`targetDamage`), `weaken-boss` (`bossDamage`). Time-based objectives correctly pass
`dt` deltas (`survive`, `hold-zones`, …). If those metrics are cumulative, progress over-counts wildly
(e.g. `close-rifts` target 5 completes in 5 ticks after closing a single rift).

Nothing in the repo or tests populates `context.metrics`, so the delta-vs-cumulative contract is defined
externally (likely the legacy encounter driver). **Confirm with the encounter-metrics owner** whether these
metrics are deltas or totals; if totals, either track a `lastSeen` per objective and add the delta, or set
`state.progress` directly instead of accumulating.

---

## What's working well (verified)
- **Security:** consistent `escapeHtml` on all interpolated `innerHTML`; `safeImageDataUrl` restricts
  thumbnails to `data:image/(png|jpeg|webp)` base64. No XSS/injection found across 30 interpolating files.
- **Save robustness:** `save-store.js` layers main → pending → legacy → default recovery, backs up corrupt
  saves, and treats a single localStorage set as atomic (no stranded write-ahead copies).
- **Determinism:** `mulberry32` RNG round-trips seed/state correctly; run IDs snapshot & restore via
  checkpoints.
- **Discipline:** no `TODO`/`FIXME`/`HACK` markers; `console.*` usage is minimal and intentional; content
  catalogs have no duplicate IDs and match validator-enforced counts.
