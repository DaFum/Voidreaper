# Live Playtest Integration Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair the progression and presentation boundaries found in the live playtest, then prove the complete unlock-and-equip flow through ordinary gameplay.

**Architecture:** Keep unlock derivation in the research feature, campaign reward persistence in the sector feature, and UI-only labels in the loadout screen. Bootstrap coordinates these existing services and uses small pure helpers for campaign-resume and live-meta decisions.

**Tech Stack:** Vite, vanilla ES modules, Node test runner, Vitest/happy-dom, in-app Browser.

## Global Constraints

- Do not technically edit the player save to satisfy unlock counts.
- Preserve ordinary run-item expiry; only successful campaign extraction persists module blueprints.
- Keep changes local and do not refactor unrelated bootstrap or progression code.
- Write and observe a failing regression test before every production change.
- Finish with `npm test`, `npm run test:frontend`, `npm run build`, `git diff --check`, and a fresh live browser test.

---

### Task 1: Persist extracted module blueprints and derive unlocks

**Files:**
- Modify: `tests/features/unlock-service.test.js`
- Modify: `tests/features/sectors/campaign-reward-service.test.js`
- Modify: `src/features/research/unlock-service.js`
- Modify: `src/features/sectors/campaign-reward-service.js`
- Modify: `src/app/bootstrap.js`

**Interfaces:**
- Produces: `unlockFlagsFromSave(save): Record<string, boolean>`
- Produces: `campaignRewards.extractBlueprints(run): Promise<{ applied: boolean, definitionIds: string[] }>`

- [ ] **Step 1: Add failing unlock derivation tests**

Test that `unlockFlagsFromSave({ unlocks: { bastion: true }, blueprints: { "shield-pulse": {} } })` returns both flags while ignoring false unlocks and tolerating missing containers.

- [ ] **Step 2: Run the unlock test and confirm RED**

Run: `node --test tests/features/unlock-service.test.js`

Expected: FAIL because `unlockFlagsFromSave` is not exported.

- [ ] **Step 3: Implement minimal unlock derivation**

Add an exported helper that copies `save.unlocks` and marks every key in `save.blueprints` as `true`. Initialize and hydrate the existing unlock service through this helper in `bootstrap.js`.

- [ ] **Step 4: Run the unlock test and confirm GREEN**

Run: `node --test tests/features/unlock-service.test.js`

Expected: PASS.

- [ ] **Step 5: Add failing extraction tests**

Test that `extractBlueprints` persists unique passive/active/utility/relic definition IDs, ignores ship/weapon/reactor and unknown IDs, preserves an existing blueprint object, and returns an empty result for an inventory without modules.

- [ ] **Step 6: Run the campaign reward test and confirm RED**

Run: `node --test tests/features/sectors/campaign-reward-service.test.js`

Expected: FAIL because `extractBlueprints` does not exist.

- [ ] **Step 7: Implement extraction persistence and bootstrap coordination**

Extend `createCampaignRewardService({ equipment, eventBus, saveStore })`. Resolve inventory definitions through `equipment.get`, persist missing blueprint keys through `saveStore.update`, and emit `campaign-blueprints-extracted`. When an extraction combat node completes, await this operation, reload `metaSave`, hydrate unlocks through `unlockFlagsFromSave`, then checkpoint and return to the map.

- [ ] **Step 8: Run focused tests and confirm GREEN**

Run: `node --test tests/features/unlock-service.test.js tests/features/sectors/campaign-reward-service.test.js tests/app/bootstrap-source.test.js`

Expected: PASS.

### Task 2: Separate campaign continuation from stale standard runs

**Files:**
- Modify: `tests/app/click-path-flows.test.js`
- Modify: `src/app/click-path-flows.js`
- Modify: `src/app/bootstrap.js`

**Interfaces:**
- Produces: `canResumeCampaignCombat(game): boolean`

- [ ] **Step 1: Add a failing predicate regression**

Cover an alive `standard` player in `state: "start"` as false, the same player in `state: "sector-map"` as true, and dead/tutorial/zero-wave variants as false.

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `node --test tests/app/click-path-flows.test.js`

Expected: FAIL because the predicate is missing.

- [ ] **Step 3: Implement and wire the predicate**

Add the pure predicate and replace the inline `game.mode/player/wave/hp` condition in `bootstrap.js`.

- [ ] **Step 4: Run the focused tests and confirm GREEN**

Run: `node --test tests/app/click-path-flows.test.js tests/app/bootstrap-source.test.js`

Expected: PASS.

### Task 3: Refresh Hangar meta and show player-facing loadout names

**Files:**
- Modify: `tests/app/click-path-flows.test.js`
- Modify: `tests/frontend/screens.spec.js`
- Modify: `src/app/click-path-flows.js`
- Modify: `src/app/bootstrap.js`
- Modify: `src/ui/screens/loadout-screen.js`

**Interfaces:**
- Produces: `syncMetaFromLegacy(metaSave, legacyData): metaSave`
- Produces: `loadoutDefinitionNames(inspection): Map<string, string>`

- [ ] **Step 1: Add failing live-meta and visible-name tests**

Assert that live shards/kills/runs replace stale in-memory values without dropping unrelated currencies, and that a slot containing `reaper-blades` renders `REAPER BLADES` when its inspection source has that name.

- [ ] **Step 2: Run both focused test files and confirm RED**

Run: `node --test tests/app/click-path-flows.test.js && npm run test:frontend -- tests/frontend/screens.spec.js`

Expected: FAIL because the helpers and player-facing slot rendering are missing.

- [ ] **Step 3: Implement minimal synchronization and label lookup**

Synchronize `metaSave` from `legacySave.data` inside `ui.renderHangar` immediately before rendering. Build the loadout name map from `inspection.sources` and use it for slot text and accessible names, falling back to the definition ID.

- [ ] **Step 4: Run both focused test files and confirm GREEN**

Run: `node --test tests/app/click-path-flows.test.js && npm run test:frontend -- tests/frontend/screens.spec.js`

Expected: PASS.

### Task 4: Full verification and live playtest

**Files:**
- Verify only.

- [ ] **Step 1: Run automated verification**

Run: `npm test`, `npm run test:frontend`, `npm run build`, and `git diff --check`.

Expected: every command exits 0 with no test failures.

- [ ] **Step 2: Run the real browser journey**

Start a clean ordinary profile through the visible game UI. Earn the required resources, purchase research until at least two ships and four weapons are unlocked, complete campaign nodes and a successful extraction until three modules are unlocked, equip one newly unlocked ship, one of the four weapons, and all three modules, then start combat.

- [ ] **Step 3: Verify player-visible results**

Confirm the catalog counts, final Loadout names, energy/load telemetry, active-module control, fresh campaign wave/score values, current Hangar currency, and browser console. Reproduce and fix any additional deterministic regression through the same red-green cycle.

