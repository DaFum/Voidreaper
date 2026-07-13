# Interactive Tutorial Phase 4: Run and Assembly Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Teach sector navigation, services, checkpoints, Quick-Mount, workbench operations, repair, and blueprints through their existing production paths.

**Architecture:** Existing screens gain stable target IDs and emit semantic events only after their current callbacks succeed. Chapter content composes onto the registry from Phase 2; assembly rules remain in existing feature controllers.

**Tech Stack:** Existing sector/service screens, ship-assembly controllers and overlays, Node tests, Vitest, assembly validator, Playwright web-game client.

## Global Constraints

- Do not move assembly rules into tutorial or UI modules.
- Invalid purchase, workshop action, port choice, or placement must not advance.
- Preserve node/port IDs and blueprint schemas.
- Verify desktop and touch assembly layouts together.
- Run `npm run validate:assembly` after every assembly task.

---

### Task 1: Teach sector map, merchant, workshop, checkpoint, and anomaly flows

**Files:**
- Create: `src/content/tutorial/run-navigation-tutorial.js`
- Modify: `src/content/tutorial/tutorial-chapters.js`
- Modify: `src/ui/screens/sector-map-screen.js`
- Modify: `src/ui/components/sector-node.js`
- Modify: `src/ui/screens/merchant-screen.js`
- Modify: `src/ui/screens/workshop-screen.js`
- Modify: `src/ui/screens/anomaly-screen.js`
- Modify: `src/app/click-path-flows.js`
- Modify: `src/app/bootstrap.js`
- Create: `tests/features/tutorial/run-navigation-tutorial.test.js`
- Modify: `tests/app/click-path-flows.test.js`
- Modify: `tests/frontend/screens.spec.js`

**Interfaces:**
- Produces: `RUN_NAVIGATION_STEPS`
- Publishes: `SECTOR_SELECTED`, `SECTOR_ENTERED`, `MERCHANT_PURCHASED`, `WORKSHOP_APPLIED`, `CHECKPOINT_RESUMED`, `ANOMALY_RESOLVED`

- [ ] **Step 1: Write failing chapter and success-boundary tests**

Assert exact sequence:

```js
[
  "map-overview", "node-information", "select-node", "confirm-route",
  "merchant-overview", "merchant-shortage", "buy-offer",
  "workshop-overview", "inspect-action", "apply-action",
  "checkpoint-overview", "resume-checkpoint", "anomaly-choice"
]
```

Extend click-path tests so rejected merchant/workshop actions emit no tutorial event, while successful actions emit once after state mutation.

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/features/tutorial/run-navigation-tutorial.test.js tests/app/click-path-flows.test.js`

Expected: FAIL because content and event callbacks are missing.

- [ ] **Step 3: Add stable targets**

Use:

- `sector-map`, `sector-node-<id>`, `sector-detail`, `sector-workbench`;
- `merchant-offers`, `merchant-reroll`, `merchant-leave`;
- `workshop-actions`, `workshop-preview`, `workshop-leave`;
- `anomaly-choices`;
- `checkpoint-resume` on the existing Hangar button.

Target IDs identify roles, not translated labels.

- [ ] **Step 4: Emit events after successful outcomes**

Extend `attemptMerchantPurchase` and `attemptWorkshopAction` with optional `onApplied(result)` callbacks. Call them only after the service returns success and before the existing finish/continue transition. Sector selection emits on first selection; route entry emits only when `services.sectors.enter(...)` returns true. Checkpoint resume emits after hydration and `prepareCheckpointResume`. Anomaly emits after `anomaly.resolve` returns.

- [ ] **Step 5: Re-run tests and browser-smoke the chapter**

Run: `node --test tests/features/tutorial/run-navigation-tutorial.test.js tests/app/click-path-flows.test.js`

Run: `npm run test:frontend -- tests/frontend/screens.spec.js`

Expected: PASS; shortage and invalid actions retain the current step.

- [ ] **Step 6: Commit Task 1**

```bash
git add src/content/tutorial/run-navigation-tutorial.js src/content/tutorial/tutorial-chapters.js src/ui/screens/sector-map-screen.js src/ui/components/sector-node.js src/ui/screens/merchant-screen.js src/ui/screens/workshop-screen.js src/ui/screens/anomaly-screen.js src/app/click-path-flows.js src/app/bootstrap.js tests/features/tutorial/run-navigation-tutorial.test.js tests/app/click-path-flows.test.js tests/frontend/screens.spec.js
git commit -m "feat: add contextual run navigation tutorials"
```

---

### Task 2: Teach Quick-Mount without changing placement rules

**Files:**
- Create: `src/content/tutorial/quick-mount-tutorial.js`
- Modify: `src/content/tutorial/tutorial-chapters.js`
- Modify: `src/ui/ship-assembly/quick-mount-overlay.js`
- Modify: `src/app/bootstrap.js`
- Modify: `tests/frontend/ship-assembly.spec.js`
- Create: `tests/features/tutorial/quick-mount-tutorial.test.js`

**Interfaces:**
- Produces: `QUICK_MOUNT_STEPS`
- Publishes: `QUICK_MOUNT_ACTION` with `{ action, pendingMountId, success }`

- [ ] **Step 1: Write failing content and interaction tests**

Sequence: `quick-mount-overview`, `compare-position`, `next-position`, `previous-position`, `confirm-mount`, `defer-item`, `details`. Test that `confirm-mount` matches only `{ action: "confirm", success: true }` and defer matches only a successfully stored item.

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/features/tutorial/quick-mount-tutorial.test.js`

Run: `npm run test:frontend -- tests/frontend/ship-assembly.spec.js`

Expected: FAIL because targets/events are absent.

- [ ] **Step 3: Add targets and result-aware callbacks**

Mark preview, reason, deltas, details, previous, next, confirm, and defer controls with IDs `quick-mount-preview`, `quick-mount-reason`, `quick-mount-deltas`, `quick-mount-details`, and `quick-mount-<action>`.

In bootstrap, capture the controller result before emitting:

```js
const result = services.quickMount.confirm();
events.emit(TUTORIAL_EVENTS.QUICK_MOUNT_ACTION, {
  action: "confirm",
  pendingMountId: session.pendingMount.pendingMountId,
  success: Boolean(result)
});
```

Apply the same success rule to defer. Previous/next emit after selected index changes.

- [ ] **Step 4: Verify focused tests and assembly validator**

Run: `node --test tests/features/tutorial/quick-mount-tutorial.test.js`

Run: `npm run test:frontend -- tests/frontend/ship-assembly.spec.js`

Run: `npm run validate:assembly`

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add src/content/tutorial/quick-mount-tutorial.js src/content/tutorial/tutorial-chapters.js src/ui/ship-assembly/quick-mount-overlay.js src/app/bootstrap.js tests/frontend/ship-assembly.spec.js tests/features/tutorial/quick-mount-tutorial.test.js
git commit -m "feat: guide quick mount with result events"
```

---

### Task 3: Teach workbench selection, placement, view, and repair

**Files:**
- Create: `src/content/tutorial/workbench-tutorial.js`
- Modify: `src/content/tutorial/tutorial-chapters.js`
- Modify: `src/ui/ship-assembly/assembly-workbench-screen.js`
- Modify: `src/ui/ship-assembly/assembly-inspector-panel.js`
- Modify: `src/ui/ship-assembly/assembly-view-modes.js`
- Modify: `src/app/bootstrap.js`
- Modify: `tests/ui/assembly-workbench-screen.test.js`
- Modify: `tests/ui/assembly-view-modes.test.js`
- Create: `tests/features/tutorial/workbench-tutorial.test.js`

**Interfaces:**
- Produces: `WORKBENCH_STEPS`
- Publishes: `WORKBENCH_ACTION` with `{ action, success, nodeId, portId, viewMode }`

- [ ] **Step 1: Write failing sequence and negative-path tests**

Sequence:

```js
[
  "workbench-overview", "select-inventory-item", "inspect-port", "mount-module",
  "select-installed-node", "rotate-node", "move-branch", "dismantle-node",
  "switch-view-mode", "zoom-pan-reset", "inspect-damage", "repair-module"
]
```

Assert occupied/invalid ports, action buttons without a selected node, rejected movement, and unaffordable repair do not match success predicates.

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/features/tutorial/workbench-tutorial.test.js tests/ui/assembly-workbench-screen.test.js tests/ui/assembly-view-modes.test.js`

Expected: FAIL because content and targets are absent.

- [ ] **Step 3: Add stable role targets to workbench UI**

Use `workbench-inventory`, `workbench-stage`, `workbench-ports`, `workbench-modes`, `workbench-inspector`, `workbench-hint`, `workbench-camera`, plus action IDs `workbench-action-<action>`. Dynamic port/node IDs remain payload values, not target IDs.

- [ ] **Step 4: Publish after controller results**

Wrap the existing `onAction` branches. Emit selection events after session state changes, mount only when `nodeId` is truthy, rotate/move/dismantle only after controller completion, mode after `setViewMode`, and repair only after `services.repairs.apply` succeeds. Preserve current render order.

- [ ] **Step 5: Verify desktop/mobile UI and assembly contracts**

Run: `node --test tests/features/tutorial/workbench-tutorial.test.js tests/ui/assembly-workbench-screen.test.js tests/ui/assembly-view-modes.test.js`

Run: `npm run test:frontend -- tests/frontend/ship-assembly.spec.js`

Run: `npm run validate:assembly`

Expected: PASS.

- [ ] **Step 6: Commit Task 3**

```bash
git add src/content/tutorial/workbench-tutorial.js src/content/tutorial/tutorial-chapters.js src/ui/ship-assembly/assembly-workbench-screen.js src/ui/ship-assembly/assembly-inspector-panel.js src/ui/ship-assembly/assembly-view-modes.js src/app/bootstrap.js tests/ui/assembly-workbench-screen.test.js tests/ui/assembly-view-modes.test.js tests/features/tutorial/workbench-tutorial.test.js
git commit -m "feat: add interactive workbench tutorial"
```

---

### Task 4: Teach blueprint library actions and run the phase browser gate

**Files:**
- Create: `src/content/tutorial/blueprint-tutorial.js`
- Modify: `src/content/tutorial/tutorial-chapters.js`
- Modify: `src/ui/ship-assembly/blueprint-library-screen.js`
- Modify: `src/ui/ship-assembly/blueprint-detail-screen.js`
- Modify: `src/ui/ship-assembly/blueprint-import-dialog.js`
- Modify: `src/app/bootstrap.js`
- Modify: `tests/ui/blueprint-ux.test.js`
- Create: `tests/features/tutorial/blueprint-tutorial.test.js`
- Create: `tests/frontend/tutorial-run-assembly.spec.js`

**Interfaces:**
- Produces: `BLUEPRINT_STEPS`
- Publishes: `BLUEPRINT_ACTION` with `{ action, success, blueprintId }`

- [ ] **Step 1: Write failing blueprint sequence tests**

Sequence: `blueprint-library`, `create-blueprint`, `open-blueprint`, `activate-blueprint`, `rename-blueprint`, `duplicate-blueprint`, `export-blueprint`, `import-validate`, `import-blueprint`. Invalid import must stay on `import-validate` and show the existing actionable message.

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/features/tutorial/blueprint-tutorial.test.js tests/ui/blueprint-ux.test.js`

Expected: FAIL because targets/events are absent.

- [ ] **Step 3: Add targets and emit after awaited service success**

Mark library header/actions/grid, detail actions, import textarea/report/inspect/import. In bootstrap, emit only after awaited blueprint service calls resolve; canceling rename/delete emits nothing. Clipboard export counts as success only after write succeeds or the fallback dialog opens.

- [ ] **Step 4: Execute the browser chapter walkthrough**

From a deterministic run, exercise map selection, merchant rejection and success, workshop, checkpoint resume, Quick-Mount next/previous/confirm/defer, workbench mount/rotate/view/dismantle, and blueprint create/activate/export/import. Reset state between scenarios. Capture and inspect screenshots for map, Quick-Mount, workbench desktop, workbench 390×844, and blueprint import.

- [ ] **Step 5: Run the phase gate**

Run: `node --test tests/features/tutorial/run-navigation-tutorial.test.js tests/features/tutorial/quick-mount-tutorial.test.js tests/features/tutorial/workbench-tutorial.test.js tests/features/tutorial/blueprint-tutorial.test.js`

Run: `npm run test:frontend -- tests/frontend/tutorial-run-assembly.spec.js tests/frontend/ship-assembly.spec.js`

Run: `npm run validate:assembly`

Run: `npm run build`

Expected: all PASS; screenshots align with text state; no new console warnings/errors.

- [ ] **Step 6: Commit Task 4**

```bash
git add src/content/tutorial/blueprint-tutorial.js src/content/tutorial/tutorial-chapters.js src/ui/ship-assembly/blueprint-library-screen.js src/ui/ship-assembly/blueprint-detail-screen.js src/ui/ship-assembly/blueprint-import-dialog.js src/app/bootstrap.js tests/ui/blueprint-ux.test.js tests/features/tutorial/blueprint-tutorial.test.js tests/frontend/tutorial-run-assembly.spec.js
git commit -m "feat: complete run and assembly tutorial chapters"
```
