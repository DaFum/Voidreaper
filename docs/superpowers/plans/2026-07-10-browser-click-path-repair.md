# Browser Click-Path Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair every browser-reproduced dead, misleading, stale, or incomplete click path while preserving the existing game architecture.

**Architecture:** Keep game rules in feature services, UI affordances in their existing screen modules, and cross-screen decisions in a small app-level flow helper. Reuse the existing loadout, blueprint detail, simulator, and assembly overlay implementations instead of creating parallel systems.

**Tech Stack:** Vite 7, browser-native ES modules, Node.js built-in test runner, Canvas 2D.

## Global Constraints

- Keep edits local to the owning subsystem and preserve existing conventions.
- Do not change save shapes or content counts.
- Every behavior change starts with a failing `node --test` regression.
- Final verification is `npm test`, `npm run build`, and an in-app Browser retest.

---

### Task 1: Test Harness and Cross-Screen Decision Flows

**Files:**
- Create: `tests/app/click-path-flows.test.js`
- Create: `src/app/click-path-flows.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `attemptMerchantPurchase`, `attemptWorkshopAction`, and `prepareCheckpointResume`.

- [ ] **Step 1: Write failing tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { attemptMerchantPurchase, attemptWorkshopAction, prepareCheckpointResume } from "../../src/app/click-path-flows.js";

test("merchant rejection keeps the service open and reports the shortage", () => {
  let finished = false, rejected = false;
  const bought = attemptMerchantPurchase({ merchant: { buy: () => false }, run: {}, offer: {}, finish: () => { finished = true; }, onRejected: () => { rejected = true; } });
  assert.equal(bought, false); assert.equal(finished, false); assert.equal(rejected, true);
});

test("successful workshop action finishes the node", () => {
  let finished = false;
  const applied = attemptWorkshopAction({ workshop: { apply: () => true }, session: {}, action: "overclock", target: {}, payload: {}, finish: () => { finished = true; } });
  assert.equal(applied, true); assert.equal(finished, true);
});

test("checkpoint preparation initializes assembly without consuming the resumed run", () => {
  const services = {}; const calls = [];
  prepareCheckpointResume({ services, controller: { attachLegacy: (_game, options) => calls.push(options) }, game: {}, run: { id: "checkpoint" } });
  assert.deepEqual(calls, [{ sync: false }]); assert.equal(services.resumeRun.id, "checkpoint");
});
```

- [ ] **Step 2: Run `node --test tests/app/click-path-flows.test.js` and verify the missing-module failure.**
- [ ] **Step 3: Implement the three minimal helpers; only call `finish` after a successful service result, and call `controller.attachLegacy(game, { sync: false })` while restoring `services.resumeRun` afterward.**
- [ ] **Step 4: Add `"test": "node --test"` to `package.json` and verify the focused test passes.**

### Task 2: Merchant, Workshop, and Sector Navigation

**Files:**
- Create: `tests/ui/service-navigation.test.js`
- Modify: `src/ui/screens/merchant-screen.js`
- Modify: `src/ui/screens/workshop-screen.js`
- Modify: `src/ui/components/sector-node.js`
- Modify: `src/app/bootstrap.js`

**Interfaces:**
- Produces: `canAffordOffer(resources, offer)` and service screens with `onLeave` callbacks.
- Consumes: Task 1 flow helpers.

- [ ] **Step 1: Write failing tests proving scrap/flux affordability and that visited nodes are non-interactive.**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { canAffordOffer } from "../../src/ui/screens/merchant-screen.js";
import { isSectorNodeInteractive } from "../../src/ui/components/sector-node.js";
test("flux offer requires enough flux", () => assert.equal(canAffordOffer({ scrap: 99, flux: 6 }, { currency: "flux", price: 36 }), false));
test("visited sector nodes are not interactive", () => assert.equal(isSectorNodeInteractive("visited"), false));
```

- [ ] **Step 2: Run the focused test and verify both exports are missing.**
- [ ] **Step 3: Disable unaffordable offers with an accessible reason, add explicit `ZURÜCK ZUR KARTE` buttons to merchant/workshop, and disable both locked and visited sector nodes.**
- [ ] **Step 4: Wire buy/apply through Task 1 helpers, keep rejected services open with a toast, and let service leave complete the node without a purchase/action.**
- [ ] **Step 5: Run the focused tests and `npm run build`.**

### Task 3: Live Hangar State and Real Loadout Screen

**Files:**
- Create: `tests/ui/hangar-state.test.js`
- Modify: `src/ui/screens/hangar-screen.js`
- Modify: `src/app/bootstrap.js`

**Interfaces:**
- Produces: `resolveCurrencies(currencies)` accepting either a current object or getter.
- Consumes: existing `createLoadoutService`, `createEmptyLoadout`, and `renderLoadoutScreen`.

- [ ] **Step 1: Write a failing test that mutates a currency source between calls and expects the new value from `resolveCurrencies`.**
- [ ] **Step 2: Verify the missing-export failure.**
- [ ] **Step 3: Resolve currencies on every Hangar render, construct the existing loadout service in bootstrap, and render `metaSave.loadouts.primary` or a valid empty loadout in the Loadout tab.**
- [ ] **Step 4: Wire blueprint template changes through `services.blueprints.setActive`, reload `metaSave`, and rerender.**
- [ ] **Step 5: Run the focused test and build.**

### Task 4: Complete Blueprint Detail and Import Paths

**Files:**
- Create: `tests/ui/blueprint-ux.test.js`
- Modify: `src/ui/ship-assembly/blueprint-import-dialog.js`
- Modify: `src/ui/ship-assembly/blueprint-detail-screen.js`
- Modify: `src/app/bootstrap.js`

**Interfaces:**
- Produces: `blueprintImportErrorMessage(error)` and detail action `back`.
- Consumes: existing blueprint service methods and `encodeBlueprint`.

- [ ] **Step 1: Write failing tests expecting malformed parser errors to normalize to `Der Bauplan-Code ist beschädigt oder unvollständig.` and known German validation errors to remain unchanged.**
- [ ] **Step 2: Verify the missing-export failure.**
- [ ] **Step 3: Add a back action and active-state label to the detail screen; normalize import errors in the dialog.**
- [ ] **Step 4: Replace the blueprint toast with detail rendering and wire activate, rename, duplicate, variant, export, delete, and back to existing service methods; rerender after mutations and provide cancellation-safe prompts/confirmations.**
- [ ] **Step 5: Run focused tests and build.**

### Task 5: Deterministic Simulator Run

**Files:**
- Create: `tests/features/build-simulator.test.js`
- Modify: `src/features/simulator/build-simulator.js`
- Modify: `src/app/bootstrap.js`

**Interfaces:**
- Produces: `simulate(run)` returning a deterministic non-zero summary and preserving `run.simulator` configuration.

- [ ] **Step 1: Write a failing test that creates the same configured run twice, calls `simulate`, expects equal summaries, positive DPS/triggers, and elapsed time equal to duration.**
- [ ] **Step 2: Verify `simulate` is missing.**
- [ ] **Step 3: Implement a bounded deterministic second-by-second model using enemy health, density, duration, seed RNG, and loadout-derived damage/heat when present, with the starter railgun as the explicit empty-loadout baseline.**
- [ ] **Step 4: Pass both `config` and `summary` back into `renderSimulatorScreen` so submitted controls remain visible.**
- [ ] **Step 5: Run focused tests and build.**

### Task 6: Checkpoint Workbench Preparation

**Files:**
- Create: `tests/app/game-controller-attach.test.js`
- Modify: `src/app/game-controller.js`
- Modify: `src/app/bootstrap.js`

**Interfaces:**
- Produces: `controller.attachLegacy(game, { sync = true } = {})`.
- Consumes: Task 1 `prepareCheckpointResume`.

- [ ] **Step 1: Add a focused source-level contract test asserting the optional `sync` gate prevents `syncLegacy` during preparation while normal calls still synchronize.**
- [ ] **Step 2: Verify the test fails because `attachLegacy` has no options gate.**
- [ ] **Step 3: Add the optional sync flag without changing normal run startup, and call `prepareCheckpointResume` from the hydration callback before showing the map.**
- [ ] **Step 4: Run the checkpoint flow tests and build.**

### Task 7: Functional Workbench Modes and Selection-Aware Actions

**Files:**
- Create: `tests/ui/assembly-view-modes.test.js`
- Modify: `src/ui/ship-assembly/assembly-view-modes.js`
- Modify: `src/ui/ship-assembly/assembly-workbench-screen.js`
- Modify: `src/ui/ship-assembly/assembly-inspector-panel.js`
- Modify: `src/app/bootstrap.js`
- Modify: `src/styles/ship-assembly.css`

**Interfaces:**
- Produces: `renderViewModeOverlay(ctx, overlay)` and inspector option `actionsEnabled`.

- [ ] **Step 1: Write a failing Canvas-spy test proving connection overlays draw lines and labels.**
- [ ] **Step 2: Verify the missing renderer failure.**
- [ ] **Step 3: Render structure/energy connections, damage labels, flight center-of-mass/thrust vectors, and mode labels after the base ship.**
- [ ] **Step 4: Make occupied port controls select their node, add `select-node` handling, and disable rotate/move/dismantle unless a node is selected and the preview permits the operation.**
- [ ] **Step 5: Add selected/disabled visual states and run focused tests plus assembly validation.**

### Task 8: Codex Accessibility and Final Verification

**Files:**
- Create: `tests/ui/codex-accessibility.test.js`
- Modify: `src/ui/screens/codex-screen.js`
- Modify: `progress.md`

**Interfaces:**
- Produces: explicitly named category/status filters.

- [ ] **Step 1: Write a failing source contract test for `aria-label="Kategorie"` and `aria-label="Entdeckungsstatus"`.**
- [ ] **Step 2: Add the two labels without changing filtering behavior.**
- [ ] **Step 3: Run `npm test`, `npm run build`, then retest every repaired path in the in-app Browser and inspect console output.**
- [ ] **Step 4: Record exact verification evidence and any remaining environment limitation in `progress.md`.**

---

## Self-Review

- Coverage: every browser-confirmed issue maps to Tasks 1-8; working paths are not redesigned.
- Placeholder scan: no deferred implementation steps or unspecified error handling remain.
- Type consistency: all helper names and callbacks match the consuming tasks.
- Risk control: persistence schema and content registries remain unchanged; bootstrap changes only wire existing services and tested flow helpers.
