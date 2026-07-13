# Full Ship Build Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the persistent loadout, campaign rewards, run assembly, and 18-segment workbench path agree with the existing VOIDREAPER specifications and remain fully usable in the browser.

**Architecture:** Preserve the existing equipment, save, sector, pending-mount, compatibility, and workbench services. Add only the missing boundary adapters: starter-loadout normalization and UI persistence, loadout-to-run initialization, idempotent combat rewards, compatibility-driven debug construction, and deterministic overlay-label layout.

**Tech Stack:** Vanilla JavaScript ES modules, Vite, Node test runner, Vitest with happy-dom, Canvas 2D, localStorage-backed save store.

## Global Constraints

- Keep edits local to the owning subsystem; do not refactor adjacent bootstrap behavior.
- Treat save-shape changes as compatibility changes and preserve valid existing primary loadouts.
- Every production behavior change requires a focused failing regression test first.
- Final verification is `npm test`, `npm run test:frontend`, `npm run build`, and `git diff --check`, followed by the complete in-app-browser path.

---

### Task 1: Persisted Starter Loadout and Slot Picker

**Files:**
- Modify: `src/features/equipment/loadout-service.js`
- Modify: `src/ui/screens/loadout-screen.js`
- Modify: `src/ui/components/item-card.js`
- Modify: `src/ui/screens/hangar-screen.js`
- Modify: `src/app/bootstrap.js`
- Test: `tests/features/equipment/loadout-service.test.js`
- Test: `tests/frontend/screens.spec.js`
- Test: `tests/ui/hangar-state.test.js`

**Interfaces:**
- Produces: `createStarterLoadout(): Loadout`
- Produces: `renderLoadoutScreen(..., { choicesBySlot, onEquip, onUnequip }): void`
- Consumes: `createLoadoutService().equip(loadout, slot, index, item)` and `.unequip(...)`

- [ ] **Step 1: Write failing starter-loadout tests**

```js
import { createStarterLoadout, resolvePrimaryLoadout } from "../../../src/features/equipment/loadout-service.js";

test("new profiles receive the three unlocked starter components", () => {
  const loadout = createStarterLoadout();
  assert.equal(loadout.slots.ship[0].definitionId, "vesper");
  assert.equal(loadout.slots["primary-weapon"][0].definitionId, "railgun");
  assert.equal(loadout.slots.reactor[0].definitionId, "standard-core");
});

test("missing primary loadouts resolve to a starter loadout without replacing an existing one", () => {
  assert.equal(resolvePrimaryLoadout({}).slots.ship[0].definitionId, "vesper");
  const primary = { slots: { ship: [{ instanceId: "custom", definitionId: "bastion" }] } };
  assert.equal(resolvePrimaryLoadout({ loadouts: { primary } }), primary);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/features/equipment/loadout-service.test.js`

Expected: FAIL because `createStarterLoadout` does not exist and the current fallback has an empty ship slot.

- [ ] **Step 3: Implement the canonical starter loadout**

```js
const starterItem = definitionId => ({ instanceId: `starter-${definitionId}`, definitionId });

export function createStarterLoadout() {
  const loadout = createEmptyLoadout();
  loadout.slots.ship[0] = starterItem("vesper");
  loadout.slots[EQUIPMENT_SLOT.PRIMARY_WEAPON][0] = starterItem("railgun");
  loadout.slots[EQUIPMENT_SLOT.REACTOR][0] = starterItem("standard-core");
  return loadout;
}

export function resolvePrimaryLoadout(metaSave) {
  return metaSave?.loadouts?.primary?.slots ? metaSave.loadouts.primary : createStarterLoadout();
}
```

- [ ] **Step 4: Write failing picker and catalog-semantics tests**

```js
test("slot picker reports equip and unequip actions", () => {
  const container = root(), onEquip = vi.fn(), onUnequip = vi.fn();
  const loadout = createStarterLoadout();
  renderLoadoutScreen(container, inspection, loadout, {
    choicesBySlot: { ship: [{ id: "vesper", name: "Vesper" }] }, onEquip, onUnequip
  });
  container.querySelector('[data-slot="ship"]').click();
  container.querySelector('[data-choice="vesper"]').click();
  expect(onEquip).toHaveBeenCalledWith("ship", 0, "vesper");
  container.querySelector('[data-slot="ship"]').click();
  container.querySelector("[data-unequip]").click();
  expect(onUnequip).toHaveBeenCalledWith("ship", 0);
});

test("read-only catalog cards are not focusable buttons", () => {
  const card = createItemCard({ id: "vesper", name: "Vesper", slot: "ship", tags: [] });
  expect(card.tagName).toBe("ARTICLE");
});
```

- [ ] **Step 5: Run the UI test and verify RED**

Run: `npx vitest run tests/frontend/screens.spec.js`

Expected: FAIL because the ship slot is not a button, no picker exists, and catalog cards are always buttons.

- [ ] **Step 6: Implement the inline picker and honest card semantics**

```js
const itemCardMarkup = definition => `<span class="item-card__slot">${escapeHtml(definition.slot)}</span><strong>${escapeHtml(definition.name)}</strong><small>${escapeHtml(definition.description ?? definition.signature ?? definition.id)}</small><div>${(definition.tags ?? []).slice(0, 4).map(tag => `<i>${escapeHtml(tag.id)}</i>`).join("")}</div><b>${definition.energyCost ?? 0} E</b>`;

export function createItemCard(definition, { selected = false, locked = false, onSelect = null } = {}) {
  const card = document.createElement(onSelect ? "button" : "article");
  card.className = "item-card";
  card.dataset.itemId = definition.id;
  if (onSelect) {
    card.type = "button";
    card.disabled = locked;
    card.toggleAttribute("aria-pressed", selected);
    card.addEventListener("click", () => onSelect(definition));
  } else if (locked) card.setAttribute("aria-disabled", "true");
  card.innerHTML = itemCardMarkup(definition);
  return card;
}
```

In `renderLoadoutScreen`, render the ship slot together with every other slot. On slot click, populate one `[data-picker]` region with the supplied `choicesBySlot[slot]`, a remove action, and a close action. Choice buttons call `onEquip(slot, index, definitionId)`; remove calls `onUnequip(slot, index)`.

- [ ] **Step 7: Persist picker actions in bootstrap**

```js
const loadoutChoices = services.equipment.values()
  .filter(definition => services.unlocks.isUnlocked(definition))
  .reduce((groups, definition) => {
    (groups[definition.slot] ??= []).push(definition);
    return groups;
  }, {});
const persistLoadout = async mutate => {
  const next = structuredClone(resolvePrimaryLoadout(metaSave));
  mutate(next);
  await services.save.update(save => { save.loadouts.primary = next; });
  metaSave = await services.save.load();
  hangar.render();
};
```

Pass `choicesBySlot: loadoutChoices`, an `onEquip` callback that calls `services.loadouts.equip` with a stable `loadout-${slot}-${index}-${definitionId}` instance ID, and an `onUnequip` callback that calls `services.loadouts.unequip`.

- [ ] **Step 8: Run focused tests and commit**

Run: `node --test tests/features/equipment/loadout-service.test.js tests/ui/hangar-state.test.js && npx vitest run tests/frontend/screens.spec.js`

Expected: all focused tests PASS.

```bash
git add src/features/equipment/loadout-service.js src/ui/screens/loadout-screen.js src/ui/components/item-card.js src/ui/screens/hangar-screen.js src/app/bootstrap.js tests/features/equipment/loadout-service.test.js tests/frontend/screens.spec.js tests/ui/hangar-state.test.js
git commit -m "fix: connect persistent hangar loadouts"
```

---

### Task 2: Apply the Primary Loadout to New Runs

**Files:**
- Modify: `src/app/game-controller.js`
- Modify: `src/app/bootstrap.js`
- Test: `tests/app/game-controller-attach.test.js`

**Interfaces:**
- Consumes: `services.primaryLoadout(): Loadout`
- Produces: `resolveRunLoadout(services): Loadout`
- Produces: `run.loadout` and assembly root/items matching the primary loadout

- [ ] **Step 1: Write failing run-loadout tests**

```js
import { resolveRunLoadout } from "../../src/app/game-controller.js";

test("new runs consume the current persistent primary loadout", () => {
  const loadout = { slots: { ship: [{ definitionId: "bastion" }] } };
  assert.equal(resolveRunLoadout({ primaryLoadout: () => loadout }), loadout);
});

test("run loadout falls back to the canonical starter loadout", () => {
  assert.equal(resolveRunLoadout({}).slots.ship[0].definitionId, "vesper");
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/app/game-controller-attach.test.js`

Expected: FAIL because `resolveRunLoadout` is absent.

- [ ] **Step 3: Implement provider resolution and run initialization**

```js
export const resolveRunLoadout = services => services.primaryLoadout?.() ?? createStarterLoadout();
```

In `attachLegacy`, set `run.loadout = structuredClone(resolveRunLoadout(services))` for fresh non-tutorial runs. Resolve `shipFrameId` from `run.loadout.slots.ship[0].definitionId`. Add all equipped non-ship items to `run.inventory`, then mount each item through the first compatible root/child port using `services.compatibility.evaluate`; retain unmounted items as loose inventory rather than dropping them.

- [ ] **Step 4: Wire the provider and verify**

```js
services.primaryLoadout = () => resolvePrimaryLoadout(metaSave);
const controller = createGameController(services);
```

Run: `node --test tests/app/game-controller-attach.test.js tests/features/equipment/loadout-service.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/game-controller.js src/app/bootstrap.js tests/app/game-controller-attach.test.js
git commit -m "fix: initialize runs from primary loadout"
```

---

### Task 3: Idempotent Combat and Elite Rewards

**Files:**
- Create: `src/features/sectors/campaign-reward-service.js`
- Create: `tests/features/sectors/campaign-reward-service.test.js`
- Modify: `src/app/bootstrap.js`

**Interfaces:**
- Produces: `createCampaignRewardService({ equipment, eventBus }).apply(run, node)`
- Consumes: `run.ids`, `run.inventory`, `run.resources`, `node.type`, `node.seed`, `node.danger`

- [ ] **Step 1: Write failing deterministic/idempotent reward tests**

```js
test("combat grants scrap and one item exactly once", () => {
  const events = [], service = createCampaignRewardService({ equipment, eventBus: { emit: (...args) => events.push(args) } });
  const run = createRunState({ seed: 1 });
  const node = { id: "combat-1", type: "combat", seed: 42, danger: 2 };
  const first = service.apply(run, node), second = service.apply(run, node);
  assert.equal(first.applied, true);
  assert.equal(second.applied, false);
  assert.equal(run.inventory.length, 1);
  assert.equal(events[0][0], "run-item-acquired");
  assert.equal(events[0][1].run, run);
});

test("elite grants flux and a rare item", () => {
  const run = createRunState({ seed: 2 });
  const result = service.apply(run, { id: "elite-1", type: "elite", seed: 7, danger: 3 });
  assert.equal(result.item.rarity, "rare");
  assert.ok(run.resources.flux > 0);
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/features/sectors/campaign-reward-service.test.js`

Expected: FAIL because the service module is absent.

- [ ] **Step 3: Implement the reward service**

```js
export function createCampaignRewardService({ equipment, eventBus }) {
  return {
    apply(run, node) {
      run.rewardedNodeIds ??= [];
      if (!node || run.rewardedNodeIds.includes(node.id) || !["combat", "elite"].includes(node.type)) return { applied: false };
      const rng = createRunRng(node.seed);
      const pool = equipment.values().filter(definition => ["passive", "active", "utility", "relic"].includes(definition.slot));
      const definition = rng.pick(pool);
      const rarity = node.type === "elite" ? "rare" : "common";
      const item = createItemInstance(definition, { ids: run.ids, rarity, itemPower: 100 + node.danger * 10, affixes: [], sockets: [], runId: run.id });
      item.ownership = "temporary";
      run.inventory.push(item);
      if (node.type === "combat") run.resources.scrap += 10 + node.danger * 5;
      else run.resources.flux += 1 + node.danger;
      run.rewardedNodeIds.push(node.id);
      eventBus.emit("run-item-acquired", { item, source: `sector-${node.type}`, run });
      return { applied: true, item };
    }
  };
}
```

- [ ] **Step 4: Integrate before adoption/checkpoint**

Create `services.campaignRewards` after the equipment registry. In the campaign `game.startWave` boundary, find the active node through `flattenSectorMap(previewRun.campaign.map)`, call `services.campaignRewards.apply(controller.run, node)`, then adopt the combat state, complete the node, and write the checkpoint.

- [ ] **Step 5: Verify and commit**

Run: `node --test tests/features/sectors/campaign-reward-service.test.js tests/app/click-path-flows.test.js`

Expected: PASS.

```bash
git add src/features/sectors/campaign-reward-service.js tests/features/sectors/campaign-reward-service.test.js src/app/bootstrap.js
git commit -m "fix: grant advertised campaign combat rewards"
```

---

### Task 4: Compatibility-Driven Maximum Construction

**Files:**
- Modify: `src/features/ship-assembly/debug/assembly-debug-scenarios.js`
- Create: `tests/features/ship-assembly/debug/assembly-debug-scenarios.test.js`
- Modify: `src/app/bootstrap.js`

**Interfaces:**
- Produces: `findMaximumConstructionCandidate({ state, geometry, ports, definitions, evaluate })`
- Consumes: the same `compatibility.evaluate` contract used by the workbench

- [ ] **Step 1: Write a failing candidate-selection test**

```js
test("maximum construction skips candidates rejected by compatibility", () => {
  const bad = { id: "bad", assembly: { childPorts: [1, 2] } };
  const good = { id: "good", assembly: { childPorts: [] } };
  const candidate = findMaximumConstructionCandidate({
    state: { nodesById: {} }, geometry: {}, ports: [{ portId: "p1", branchDepth: 0 }], definitions: [bad, good],
    evaluate: ({ moduleProfile }) => ({ compatible: moduleProfile.definitionId === "good" })
  });
  assert.equal(candidate.definition.id, "good");
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/features/ship-assembly/debug/assembly-debug-scenarios.test.js`

Expected: FAIL because the selector is absent.

- [ ] **Step 3: Implement deterministic compatible selection**

```js
export function findMaximumConstructionCandidate({ state, geometry, ports, definitions, evaluate }) {
  const orderedPorts = ports.filter(port => !port.occupiedByNodeId).sort((a, b) => (a.branchDepth ?? 0) - (b.branchDepth ?? 0) || a.portId.localeCompare(b.portId));
  const orderedDefinitions = [...definitions].sort((a, b) => (b.assembly.childPorts?.length ?? 0) - (a.assembly.childPorts?.length ?? 0) || a.id.localeCompare(b.id));
  for (const port of orderedPorts) for (const definition of orderedDefinitions) {
    const moduleProfile = { ...definition.assembly, definitionId: definition.id, tags: definition.tags };
    if (evaluate({ state, moduleProfile, port, geometrySnapshot: geometry }).compatible) return { port, definition };
  }
  return null;
}
```

- [ ] **Step 4: Replace the inline permissive filter**

On every iteration, rebuild geometry, call `findMaximumConstructionCandidate` with `services.compatibility.evaluate`, mount only the returned pair, and stop with `{ built: false, reason: "no-compatible-candidate", nodes, segments }` if no pair remains before 18 segments. Keep the hard attempt limit as an infinite-loop guard only.

- [ ] **Step 5: Verify and commit**

Run: `node --test tests/features/ship-assembly/debug/assembly-debug-scenarios.test.js && npm run validate:assembly`

Expected: PASS and validator reports 152 equipment profiles, 10 ship cores, and 14 visual families.

```bash
git add src/features/ship-assembly/debug/assembly-debug-scenarios.js tests/features/ship-assembly/debug/assembly-debug-scenarios.test.js src/app/bootstrap.js
git commit -m "fix: enforce assembly contracts in maximum construction"
```

---

### Task 5: Readable Diagnostic Overlays

**Files:**
- Modify: `src/ui/ship-assembly/assembly-view-modes.js`
- Modify: `tests/ui/assembly-view-modes.test.js`
- Modify: `tests/frontend/ship-assembly.spec.js`

**Interfaces:**
- Produces: `layoutOverlayLabels(labels, { minimumDistance }): Label[]`
- Consumes: structure, energy, damage, and flight overlay labels

- [ ] **Step 1: Write a failing deterministic spacing test**

```js
test("diagnostic labels receive deterministic non-overlapping positions", () => {
  const labels = layoutOverlayLabels([
    { text: "A", position: { x: 0, y: 0 } },
    { text: "B", position: { x: 2, y: 2 } }
  ], { minimumDistance: 12 });
  assert.deepEqual(labels[0].position, { x: 0, y: 0 });
  assert.ok(Math.hypot(labels[1].position.x, labels[1].position.y) >= 12);
  assert.deepEqual(layoutOverlayLabels(labels, { minimumDistance: 12 }), labels);
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/ui/assembly-view-modes.test.js`

Expected: FAIL because `layoutOverlayLabels` is absent.

- [ ] **Step 3: Implement label layout and unified drawing**

```js
export function layoutOverlayLabels(labels, { minimumDistance = 18 } = {}) {
  const placed = [];
  for (const label of labels) {
    const next = { ...label, position: { ...label.position } };
    while (placed.some(other => Math.hypot(other.position.x - next.position.x, other.position.y - next.position.y) < minimumDistance)) next.position.y += minimumDistance;
    placed.push(next);
  }
  return placed;
}
```

In `renderViewModeOverlay`, draw all connection strokes first. Convert connection labels to midpoint label objects, concatenate normal overlay labels, pass them through `layoutOverlayLabels`, and call `fillText` once per laid-out label. Keep center-of-mass and thrust-vector drawing unchanged.

- [ ] **Step 4: Verify and commit**

Run: `node --test tests/ui/assembly-view-modes.test.js && npx vitest run tests/frontend/ship-assembly.spec.js`

Expected: PASS with unchanged connection/vector counts and spaced text coordinates.

```bash
git add src/ui/ship-assembly/assembly-view-modes.js tests/ui/assembly-view-modes.test.js tests/frontend/ship-assembly.spec.js
git commit -m "fix: keep assembly diagnostics readable"
```

---

### Task 6: Full Verification and Browser Acceptance

**Files:**
- Modify only files required by failures directly caused by Tasks 1–5.

**Interfaces:**
- Consumes all repaired production paths.
- Produces fresh automated and browser evidence.

- [ ] **Step 1: Run all Node tests**

Run: `npm test`

Expected: exit 0, zero failed tests.

- [ ] **Step 2: Run all frontend tests**

Run: `npm run test:frontend`

Expected: exit 0, zero failed Vitest tests.

- [ ] **Step 3: Run validators and production build**

Run: `npm run build`

Expected: content, assembly, and tutorial validators pass; Vite production build exits 0.

- [ ] **Step 4: Check patch hygiene**

Run: `git diff --check && git status --short`

Expected: no whitespace errors; only intentional files are modified.

- [ ] **Step 5: Repeat the in-app-browser journey**

1. Reload `http://127.0.0.1:5173/`.
2. Verify starter Vesper, Railgun, and Standard Core in Loadout.
3. Replace and remove equipment, reload, and verify persistence.
4. Start Standard Campaign and verify the selected frame/assembly.
5. Complete combat and elite nodes; verify one reward each and Quick Mount/workbench routing.
6. Open the workbench, run `maximum-construction`, and verify 18 valid segments.
7. Inspect Construction, Structure, Energy, Damage, and Flight modes; verify readable labels and unambiguous module selection.
8. Verify browser console has no warnings or errors introduced by the repair.

- [ ] **Step 6: Confirm every task commit left a clean worktree**

```bash
git status --short
```

Expected: no output. If a verification failure required a direct correction, return to the owning task's red/green cycle and commit that explicit file set before repeating Task 6.
