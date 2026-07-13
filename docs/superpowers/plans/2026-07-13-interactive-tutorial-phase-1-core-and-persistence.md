# Interactive Tutorial Phase 1: Core and Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the versioned tutorial save model, semantic event contract, and a fully tested dependency-injected tutorial coordinator.

**Architecture:** Persistence owns migration/defaults; content owns declarative definitions; the feature service owns state transitions and listens to the shared event bus. The coordinator accepts chapter fixtures in tests so no UI or game runtime is needed in this phase.

**Tech Stack:** JavaScript ES modules, Node test runner, existing save store and event bus.

## Global Constraints

- Follow [interactive tutorial design](../specs/2026-07-13-interactive-tutorial-design.md).
- Tutorial status must never mutate `save.unlocks`.
- All migrated version-5 saves set `tutorial.autoOffer` to `false`; new saves set it to `true`.
- Preserve existing save-store warning and rejected-promise behavior.
- Keep event names centralized and payloads minimal.
- No UI work and no `bootstrap.js` wiring in this phase.

---

### Task 1: Add version-6 tutorial defaults and migration

**Files:**
- Create: `src/persistence/migrations/tutorial-migration.js`
- Modify: `src/runtime/create-meta-state.js`
- Modify: `src/persistence/save-schema.js`
- Modify: `src/persistence/migrations.js`
- Modify: `tests/features/persistence/migrations.test.js`
- Modify: `tests/features/persistence/save-store.test.js`

**Interfaces:**
- Produces: `createTutorialState({ autoOffer = true } = {}) -> TutorialState`
- Produces: `migrateTutorialSave(save, { fromVersion, legacyOnboarding } = {}) -> save`
- Produces save shape: `{ version: 1, autoOffer, active, completedChapters, skippedChapters, seenSteps }`

- [ ] **Step 1: Write failing migration tests**

Append tests that deep-freeze the gameplay fields and assert only the tutorial shape changes:

```js
test("migrateSave converts version-5 onboarding without changing unlocks", () => {
  const unlocks = { vesper: true, railgun: true, "standard-core": true, bastion: false };
  const input = {
    saveVersion: 5,
    unlocks,
    onboarding: { skipped: false, completed: { 1: true, 3: true } }
  };
  const output = migrateSave(input);
  assert.equal(output.saveVersion, 6);
  assert.deepEqual(output.unlocks, unlocks);
  assert.equal(output.tutorial.autoOffer, false);
  assert.deepEqual(output.tutorial.seenSteps, {
    "legacy-run-1": true,
    "legacy-run-3": true
  });
  assert.equal("onboarding" in output, false);
});

test("migrateSave respects an old global skip without completing new chapters", () => {
  const output = migrateSave({
    saveVersion: 5,
    onboarding: { skipped: true, completed: { 1: true, 2: true, 3: true, 4: true, 5: true } }
  });
  assert.equal(output.tutorial.autoOffer, false);
  assert.deepEqual(output.tutorial.completedChapters, {});
  assert.deepEqual(output.tutorial.skippedChapters, {});
});
```

Add a save-store round-trip asserting `tutorial.active` survives `save()` and `load()`.

- [ ] **Step 2: Run the persistence tests and verify RED**

Run: `node --test tests/features/persistence/migrations.test.js tests/features/persistence/save-store.test.js`

Expected: FAIL because version 6 and `tutorial` do not exist.

- [ ] **Step 3: Implement the default state and migration**

Create `tutorial-migration.js` with these exact rules:

```js
export const createTutorialState = ({ autoOffer = true } = {}) => ({
  version: 1,
  autoOffer,
  active: null,
  completedChapters: {},
  skippedChapters: {},
  seenSteps: {}
});

export function migrateTutorialSave(save, { fromVersion = 0, legacyOnboarding } = {}) {
  if (fromVersion < 6) {
    const tutorial = createTutorialState({ autoOffer: false });
    for (const [run, completed] of Object.entries(legacyOnboarding?.completed ?? {})) {
      if (completed) tutorial.seenSteps[`legacy-run-${run}`] = true;
    }
    save.tutorial = tutorial;
  } else {
    save.tutorial = { ...createTutorialState(), ...(save.tutorial ?? {}) };
  }
  delete save.onboarding;
  return save;
}
```

Use `createTutorialState()` in `createMetaState`, replace `onboarding: meta.onboarding` with `tutorial: meta.tutorial` in `createDefaultSave`, and set `CURRENT_SAVE_VERSION = 6`. Capture `processedInput.onboarding` before defaults merge. Call `migrateTutorialSave` after the ship-assembly migration in both `migrateSave` and `migrateLegacySave`; legacy saves use `fromVersion: 0`. Do not alter `save.unlocks`.

- [ ] **Step 4: Re-run persistence tests and verify GREEN**

Run: `node --test tests/features/persistence/migrations.test.js tests/features/persistence/save-store.test.js`

Expected: PASS with no new warnings.

- [ ] **Step 5: Commit Task 1**

```bash
git add src/runtime/create-meta-state.js src/persistence/save-schema.js src/persistence/migrations.js src/persistence/migrations/tutorial-migration.js tests/features/persistence/migrations.test.js tests/features/persistence/save-store.test.js
git commit -m "feat: migrate tutorial progress to save version 6"
```

---

### Task 2: Move the remaining onboarding-gated content to regular progression

**Files:**
- Modify: `src/content/ships/bastion.js`
- Modify: `src/content/research/research-tree.js`
- Create: `tests/features/tutorial/tutorial-unlock-decoupling.test.js`

**Interfaces:**
- Consumes: existing `unlockSource` and research-node `unlocks` contracts
- Produces: Bastion through `engineering-load`, never through tutorial completion

- [ ] **Step 1: Write the failing decoupling test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { SHIPS } from "../../../src/content/ships/index.js";
import { RESEARCH_TREE } from "../../../src/content/research/research-tree.js";

test("no ship remains gated by onboarding", () => {
  assert.deepEqual(SHIPS.filter(ship => ship.unlockSource === "onboarding"), []);
  const loadRouting = RESEARCH_TREE.find(node => node.id === "engineering-load");
  assert.equal(loadRouting.unlocks.includes("bastion"), true);
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/features/tutorial/tutorial-unlock-decoupling.test.js`

Expected: FAIL listing Bastion as onboarding-gated.

- [ ] **Step 3: Reassign Bastion to existing research progression**

Change `bastion.js` to `unlockSource: "research"`. Change the `engineering-load` node description to `"Zeigt Lastfolgen früher und öffnet den Bastion-Rahmen."` and its unlock array to `["load-preview", "bastion"]`. Do not add a research node or change catalog counts.

- [ ] **Step 4: Verify content contracts**

Run: `node --test tests/features/tutorial/tutorial-unlock-decoupling.test.js tests/features/unlock-service.test.js`

Run: `npm run validate-content`

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add src/content/ships/bastion.js src/content/research/research-tree.js tests/features/tutorial/tutorial-unlock-decoupling.test.js
git commit -m "feat: decouple Bastion unlock from tutorial progress"
```

---

### Task 3: Define the semantic tutorial event contract

**Files:**
- Create: `src/features/tutorial/tutorial-events.js`
- Create: `tests/features/tutorial/tutorial-events.test.js`

**Interfaces:**
- Produces: frozen `TUTORIAL_EVENTS`
- Produces: `isTutorialEvent(value) -> boolean`

- [ ] **Step 1: Write the failing contract test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { TUTORIAL_EVENTS, isTutorialEvent } from "../../../src/features/tutorial/tutorial-events.js";

test("tutorial event names are unique and recognized", () => {
  const values = Object.values(TUTORIAL_EVENTS);
  assert.equal(new Set(values).size, values.length);
  assert.equal(isTutorialEvent(TUTORIAL_EVENTS.HANGAR_TAB_OPENED), true);
  assert.equal(isTutorialEvent("click"), false);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/features/tutorial/tutorial-events.test.js`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement the event constants**

Create a frozen object with these values:

```js
export const TUTORIAL_EVENTS = Object.freeze({
  HANGAR_TAB_OPENED: "tutorial:hangar-tab-opened",
  SETTING_CHANGED: "tutorial:setting-changed",
  BINDING_CHANGED: "tutorial:binding-changed",
  MOVEMENT_USED: "tutorial:movement-used",
  SHOT_FIRED: "shot-fired",
  DODGE_USED: "dodge-used",
  ACTIVE_MODULE_USED: "active-module-used",
  PAUSE_OPENED: "tutorial:pause-opened",
  ENEMY_DEFEATED: "tutorial:enemy-defeated",
  REWARD_COLLECTED: "tutorial:reward-collected",
  EVOLUTION_SELECTED: "tutorial:evolution-selected",
  SECTOR_SELECTED: "tutorial:sector-selected",
  SECTOR_ENTERED: "tutorial:sector-entered",
  MERCHANT_PURCHASED: "tutorial:merchant-purchased",
  WORKSHOP_APPLIED: "tutorial:workshop-applied",
  CHECKPOINT_RESUMED: "tutorial:checkpoint-resumed",
  ANOMALY_RESOLVED: "tutorial:anomaly-resolved",
  QUICK_MOUNT_ACTION: "tutorial:quick-mount-action",
  WORKBENCH_ACTION: "tutorial:workbench-action",
  BLUEPRINT_ACTION: "tutorial:blueprint-action",
  RESEARCH_PURCHASED: "tutorial:research-purchased",
  CODEX_FILTERED: "tutorial:codex-filtered",
  SIMULATION_COMPLETED: "tutorial:simulation-completed",
  EXTRACTION_COMPLETED: "tutorial:extraction-completed",
  RUN_SUMMARY_OPENED: "tutorial:run-summary-opened"
});

const KNOWN_EVENTS = new Set(Object.values(TUTORIAL_EVENTS));
export const isTutorialEvent = value => KNOWN_EVENTS.has(value);
```

- [ ] **Step 4: Re-run the test and verify GREEN**

Run: `node --test tests/features/tutorial/tutorial-events.test.js`

Expected: PASS.

- [ ] **Step 5: Commit Task 3**

```bash
git add src/features/tutorial/tutorial-events.js tests/features/tutorial/tutorial-events.test.js
git commit -m "feat: define semantic tutorial events"
```

---

### Task 4: Implement the tutorial coordinator with TDD

**Files:**
- Create: `src/features/tutorial/tutorial-service.js`
- Create: `tests/features/tutorial/tutorial-service.test.js`

**Interfaces:**
- Consumes: `saveStore.load()`, `saveStore.update(mutator)`, `eventBus.on(name, listener)`, chapter array
- Produces: `createTutorialService({ saveStore, eventBus, chapters, onPersistenceError })`
- Produces methods: `hydrate`, `snapshot`, `available`, `start`, `pause`, `resume`, `back`, `advanceExplanation`, `skipChapter`, `stop`, `destroy`
- Produces subscription: `subscribe(listener) -> unsubscribe`

- [ ] **Step 1: Write failing lifecycle tests**

Use two fixture chapters: one explanation step and two action steps with payload predicates. Assert:

```js
test("an action step advances only after the matching successful event", async () => {
  const { service, events } = fixture();
  await service.start("foundations");
  await service.advanceExplanation();
  events.emit("tutorial:movement-used", { magnitude: 0 });
  assert.equal(service.snapshot().active.stepId, "move");
  events.emit("tutorial:movement-used", { magnitude: 0.7 });
  assert.equal(service.snapshot().active.stepId, "dodge");
});

test("replay completion preserves an existing completed chapter", async () => {
  const { service, save } = fixture({ completedChapters: { foundations: true } });
  await service.start("foundations", { mode: "replay" });
  await completeFixtureChapter(service);
  assert.equal(save.tutorial.completedChapters.foundations, true);
  assert.equal(save.tutorial.active, null);
});
```

Also cover pause/resume, back limited to already seen steps, skip, unavailable chapter rejection, unknown saved step fallback, subscriber notifications, and rejected save updates calling `onPersistenceError`.

- [ ] **Step 2: Run the coordinator tests and verify RED**

Run: `node --test tests/features/tutorial/tutorial-service.test.js`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement the minimal coordinator**

Keep state in memory, clone outward snapshots, persist through one private `writeTutorial(mutator)` helper, and subscribe only to event names referenced by chapter steps. A step predicate has signature `(payload) => boolean`; absent predicate means any occurrence completes the step.

Use this chapter contract in production and tests:

```js
{
  id: "foundations",
  title: "Grundlagen-Training",
  description: "Steuerung und Kampf in einem sicheren Trainingssignal.",
  available: context => true,
  steps: [
    { id: "welcome", kind: "explanation", title: "Signal stabil", body: "..." },
    { id: "move", kind: "action", event: "tutorial:movement-used", matches: payload => payload.magnitude > 0.25 }
  ]
}
```

Do not import UI, content, runtime, or persistence modules into the service.

- [ ] **Step 4: Run focused and regression tests**

Run: `node --test tests/features/tutorial/tutorial-service.test.js tests/features/tutorial/tutorial-events.test.js tests/features/persistence/migrations.test.js tests/features/persistence/save-store.test.js`

Expected: PASS.

- [ ] **Step 5: Run the phase gate**

Run: `npm run build`

Expected: both validators and Vite build PASS.

- [ ] **Step 6: Commit Task 4**

```bash
git add src/features/tutorial/tutorial-service.js tests/features/tutorial/tutorial-service.test.js
git commit -m "feat: add persistent tutorial coordinator"
```
