# Interactive Tutorial Phase 3: Foundations Training Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a deterministic, disposable foundations run that teaches real movement, combat, resources, pause, reward, and evolution interactions without durable gameplay effects.

**Architecture:** A training-session service creates and owns tutorial-mode run state. Existing controller/input/combat paths emit semantic success events; app guards suppress checkpoint and meta persistence for tutorial mode. The chapter definition references those events and the shared overlay.

**Tech Stack:** Existing legacy canvas runtime, game controller, input controller, event bus, Node tests, Vitest, Playwright web-game client.

## Global Constraints

- The training session must use actual game input and combat code, not a separate simulation UI.
- Seed is fixed at `13072026`.
- Only `save.tutorial` may differ before versus after a complete or aborted training run.
- Keyboard/mouse and touch complete the same semantic steps.
- Do not add rewards, statistics, checkpoints, challenges, builds, or blueprints in tutorial mode.
- Add deterministic text/time test hooks without changing production frame behavior.

---

### Task 1: Add disposable training-session state

**Files:**
- Create: `src/features/tutorial/training-run-service.js`
- Create: `tests/features/tutorial/training-run-service.test.js`

**Interfaces:**
- Produces: `TRAINING_SEED = 13072026`
- Produces: `createTrainingRunService({ createRun })`
- Methods: `begin()`, `current()`, `isTrainingRun(run)`, `finish()`, `abort()`

- [ ] **Step 1: Write failing lifecycle tests**

```js
test("training sessions are deterministic and discarded on finish", () => {
  const service = createTrainingRunService({ createRun: options => ({ ...options, id: Symbol() }) });
  const first = service.begin();
  assert.equal(first.seed, 13072026);
  assert.equal(first.mode, "tutorial");
  assert.equal(service.isTrainingRun(first), true);
  service.finish();
  const second = service.begin();
  assert.equal(second.seed, first.seed);
  assert.notEqual(second.id, first.id);
});
```

Also assert a second `begin()` while active returns the current run and `abort()` clears it.

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/features/tutorial/training-run-service.test.js`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement the minimal session service**

Call the injected factory with `{ seed: TRAINING_SEED, mode: "tutorial", campaignPathId: "architect" }`. Do not import save, UI, or bootstrap.

- [ ] **Step 4: Re-run and verify GREEN**

Run: `node --test tests/features/tutorial/training-run-service.test.js`

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

```bash
git add src/features/tutorial/training-run-service.js tests/features/tutorial/training-run-service.test.js
git commit -m "feat: add disposable tutorial training sessions"
```

---

### Task 2: Make tutorial mode safe in controller and persistence paths

**Files:**
- Create: `src/app/tutorial-run-guards.js`
- Modify: `src/app/game-controller.js`
- Modify: `src/app/bootstrap.js`
- Modify: `src/runtime/create-run-state.js`
- Create: `tests/features/tutorial/tutorial-run-isolation.test.js`
- Modify: `tests/features/combat-controller-run-isolation.test.js`

**Interfaces:**
- Produces: `isTutorialRun(run) -> boolean`
- Produces: `shouldPersistTutorialSensitiveEffect(run) -> boolean`
- `createGameController.attachLegacy` preserves `mode: "tutorial"`

- [ ] **Step 1: Write failing isolation tests**

Assert controller attachment maps legacy `game.mode = "tutorial"` to a tutorial run, does not start a sector campaign, and the app guard rejects checkpoint/meta effects:

```js
test("tutorial runs reject durable side effects", () => {
  const run = createRunState({ seed: 13072026, mode: "tutorial" });
  assert.equal(isTutorialRun(run), true);
  assert.equal(shouldPersistTutorialSensitiveEffect(run), false);
  assert.equal(shouldPersistTutorialSensitiveEffect(createRunState({ mode: "campaign" })), true);
});
```

Add a save snapshot fixture and assert applying the allowed tutorial-progress update changes only `tutorial`.

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/features/tutorial/tutorial-run-isolation.test.js tests/features/combat-controller-run-isolation.test.js`

Expected: FAIL because tutorial mode is currently coerced to campaign.

- [ ] **Step 3: Implement mode preservation and guards**

In `attachLegacy`, resolve mode with:

```js
const mode = game.mode === "tutorial" ? "tutorial" : game.mode === "daily" ? "daily" : "campaign";
run = resumed ?? createRunState({ seed: game.seed, mode, campaignPathId: game.selectedCampaignPath ?? "architect" });
```

Skip `services.sectors.start(run)` for tutorial mode. Guard `writeCurrentCheckpoint`, checkpoint clear/write on game over, meta reward persistence, statistics/challenge updates, and build-history writes with `shouldPersistTutorialSensitiveEffect(controller.run)`. Do not guard `services.tutorial` writes.

- [ ] **Step 4: Re-run isolation and controller tests**

Run: `node --test tests/features/tutorial/tutorial-run-isolation.test.js tests/features/combat-controller-run-isolation.test.js tests/app/game-controller-attach.test.js`

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add src/app/tutorial-run-guards.js src/app/game-controller.js src/app/bootstrap.js src/runtime/create-run-state.js tests/features/tutorial/tutorial-run-isolation.test.js tests/features/combat-controller-run-isolation.test.js
git commit -m "feat: isolate tutorial runs from durable progression"
```

---

### Task 3: Add foundations steps and semantic gameplay publishers

**Files:**
- Create: `src/content/tutorial/foundations-tutorial.js`
- Modify: `src/content/tutorial/tutorial-chapters.js`
- Modify: `src/input/input-controller.js`
- Modify: `src/app/bootstrap.js`
- Modify: `src/legacy/legacy-runtime.js`
- Create: `tests/features/tutorial/foundations-tutorial.test.js`
- Modify: `tests/frontend/start-menu.spec.js`

**Interfaces:**
- Produces: `FOUNDATIONS_STEPS`
- Publishes payloads for `MOVEMENT_USED`, `ACTIVE_MODULE_USED`, `PAUSE_OPENED`, `ENEMY_DEFEATED`, `REWARD_COLLECTED`, `EVOLUTION_SELECTED`
- Reuses existing `shot-fired`, `dodge-used`, and `active-module-used`

- [ ] **Step 1: Write failing chapter-sequence tests**

Assert exact IDs and order:

```js
assert.deepEqual(FOUNDATIONS_STEPS.map(step => step.id), [
  "welcome", "move", "aim-fire", "dodge", "active-module",
  "read-hull-shield", "read-energy-heat", "read-corruption",
  "pause-resume", "defeat-enemy", "collect-reward", "choose-evolution", "complete"
]);
```

For every action step assert an event and match predicate. Resource-reading steps are explanations targeted at `hud-hull-shield`, `hud-energy-heat`, and `hud-corruption`.

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/features/tutorial/foundations-tutorial.test.js`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement chapter content and stable targets**

Write complete German title/body/hint text for all 13 steps. Device hints use `{ keyboard, touch }` fields. Add target IDs to the real HUD controls, pause control, evolution choices, and reward display.

- [ ] **Step 4: Add success-only event publishing**

- Input emits `MOVEMENT_USED` once per transition from neutral to magnitude `> 0.25`, with `{ source, axis, magnitude }`.
- Active module reuses the existing event that is already emitted only after resource payment and effect execution succeed.
- Pause emits after pause UI is visible.
- Enemy defeat emits after removal and kill count increment.
- Reward emits after inventory/resource state changes.
- Evolution emits after the chosen effect applies.

Do not emit tutorial-specific events from raw DOM listeners when a feature result exists.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `node --test tests/features/tutorial/foundations-tutorial.test.js tests/features/tutorial/tutorial-service.test.js`

Run: `npm run test:frontend -- tests/frontend/start-menu.spec.js`

Expected: PASS.

- [ ] **Step 6: Commit Task 3**

```bash
git add src/content/tutorial/foundations-tutorial.js src/content/tutorial/tutorial-chapters.js src/input/input-controller.js src/app/bootstrap.js src/legacy/legacy-runtime.js tests/features/tutorial/foundations-tutorial.test.js tests/frontend/start-menu.spec.js
git commit -m "feat: teach foundations through real gameplay events"
```

---

### Task 4: Wire training launch, deterministic test hooks, and browser walkthrough

**Files:**
- Create: `src/app/tutorial-training-flow.js`
- Create: `src/app/game-test-hooks.js`
- Modify: `src/app/bootstrap.js`
- Modify: `src/ui/screens/tutorial-library-screen.js`
- Create: `tests/app/tutorial-training-flow.test.js`
- Create: `tests/frontend/tutorial-training.spec.js`

**Interfaces:**
- Produces: `createTutorialTrainingFlow({ trainingRuns, tutorial, legacyGame, showHangar })`
- Methods: `start()`, `finish()`, `abort()`
- Produces in development/test: `window.render_game_to_text()` and `window.advanceTime(ms)`

- [ ] **Step 1: Write failing flow tests**

Assert `start()` activates `foundations`, starts legacy mode `tutorial`, and `finish/abort` discard the session and return to the Tutorial library. Assert calling start twice does not create parallel runs.

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/app/tutorial-training-flow.test.js`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement flow and test hooks**

`render_game_to_text` returns concise JSON containing coordinate convention, app mode, tutorial chapter/step, player position/velocity/hull/shield/resources, visible enemies, pickups, pause flag, and training flag. `advanceTime(ms)` advances fixed 1/60-second steps through the existing update entry point and renders once.

- [ ] **Step 4: Add the browser scenario**

Use `$WEB_GAME_CLIENT` with short action bursts to launch Tutorial → Grundlagen, move, fire, dodge, pause/resume, defeat the deterministic first enemy, collect reward, and choose evolution. Capture at least start, combat, resource explanation, and completion screenshots. Inspect every screenshot and the latest text state; review console errors.

- [ ] **Step 5: Verify save isolation in browser**

Capture the raw save before start and after completion. Remove only `tutorial` from both objects and assert deep equality. Repeat for abort.

- [ ] **Step 6: Run the phase gate**

Run: `node --test tests/app/tutorial-training-flow.test.js tests/features/tutorial/tutorial-run-isolation.test.js`

Run: `npm run test:frontend -- tests/frontend/tutorial-training.spec.js`

Run: `npm run build`

Expected: PASS; screenshots show target and card simultaneously; console has no new warnings/errors.

- [ ] **Step 7: Commit Task 4**

```bash
git add src/app/tutorial-training-flow.js src/app/game-test-hooks.js src/app/bootstrap.js src/ui/screens/tutorial-library-screen.js tests/app/tutorial-training-flow.test.js tests/frontend/tutorial-training.spec.js
git commit -m "feat: add deterministic foundations tutorial flow"
```
