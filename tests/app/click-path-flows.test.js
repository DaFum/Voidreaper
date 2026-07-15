import test from "node:test";
import assert from "node:assert/strict";
import { createRunState } from "../../src/runtime/create-run-state.js";
import { serializeCheckpointRun, hydrateCheckpointRun } from "../../src/features/checkpoints/checkpoint-service.js";
import {
  adoptCombatRunState,
  attemptMerchantPurchase,
  attemptWorkshopAction,
  canResumeCampaignCombat,
  canUseWorkbenchPort,
  openReplacingQuickMount,
  prepareCheckpointResume,
  resetCampaignResume,
  subscribeWorkbenchGeometry,
  syncMetaFromLegacy,
  syncLegacyVoidShards
} from "../../src/app/click-path-flows.js";

test("only a standing campaign combat run may continue from the sector map", () => {
  const standing = {
    state: "sector-map",
    mode: "standard",
    wave: 2,
    player: { hp: 50 }
  };

  assert.equal(canResumeCampaignCombat(standing), true);
  assert.equal(canResumeCampaignCombat({ ...standing, state: "start" }), false);
  assert.equal(canResumeCampaignCombat({ ...standing, mode: "tutorial" }), false);
  assert.equal(canResumeCampaignCombat({ ...standing, wave: 0 }), false);
  assert.equal(canResumeCampaignCombat({ ...standing, player: { hp: 0 } }), false);
  assert.equal(canResumeCampaignCombat({ ...standing, player: null }), false);
});

test("merchant rejection keeps the service open and reports the shortage", () => {
  let finished = false;
  let rejected = false;
  const bought = attemptMerchantPurchase({
    merchant: { buy: () => false },
    run: {},
    offer: {},
    finish: () => { finished = true; },
    onRejected: () => { rejected = true; }
  });

  assert.equal(bought, false);
  assert.equal(finished, false);
  assert.equal(rejected, true);
});

test("merchant success finishes the node", () => {
  let finished = false;
  const bought = attemptMerchantPurchase({
    merchant: { buy: () => true },
    run: {},
    offer: {},
    finish: () => { finished = true; }
  });

  assert.equal(bought, true);
  assert.equal(finished, true);
});

test("successful workshop action with remaining AP keeps the workshop open", () => {
  let finished = false;
  let continued = false;
  const session = { actionPoints: 3, used: 0 };
  const applied = attemptWorkshopAction({
    workshop: { apply: () => { session.used = 1; return true; } },
    session,
    action: "overclock",
    target: {},
    payload: {},
    finish: () => { finished = true; },
    onContinue: () => { continued = true; }
  });

  assert.equal(applied, true);
  assert.equal(finished, false);
  assert.equal(continued, true);
});

test("successful workshop action finishes when AP are exhausted", () => {
  let finished = false;
  let continued = false;
  const session = { actionPoints: 3, used: 1 };
  const applied = attemptWorkshopAction({
    workshop: { apply: () => { session.used = 3; return true; } },
    session,
    action: "overclock",
    target: {},
    payload: {},
    finish: () => { finished = true; },
    onContinue: () => { continued = true; }
  });

  assert.equal(applied, true);
  assert.equal(finished, true);
  assert.equal(continued, false);
});

test("rejected workshop action stays open", () => {
  let finished = false;
  const applied = attemptWorkshopAction({
    workshop: { apply: () => false },
    session: {},
    action: "overclock",
    target: {},
    payload: {},
    finish: () => { finished = true; }
  });

  assert.equal(applied, false);
  assert.equal(finished, false);
});

test("checkpoint preparation initializes assembly without consuming the resumed run", () => {
  const services = {};
  const calls = [];
  const run = { id: "checkpoint" };

  prepareCheckpointResume({
    services,
    controller: { attachLegacy: (_game, options) => calls.push(options) },
    game: {},
    run
  });

  assert.deepEqual(calls, [{ sync: false }]);
  assert.equal(services.resumeRun, run);
});

test("void shard synchronization updates legacy state and its visible counter", () => {
  const persistence = { data: { shards: 90 } };
  const counter = { textContent: "90" };
  const root = { querySelector: selector => selector === "#shards0" ? counter : null };

  syncLegacyVoidShards({ persistence, root, currencies: { voidShards: 45 } });

  assert.equal(persistence.data.shards, 45);
  assert.equal(counter.textContent, "45");
});

test("live legacy progress refreshes stale Hangar meta without dropping other currencies", () => {
  const metaSave = {
    currencies: { voidShards: 10, bossCores: 2 },
    profile: { totalKills: 15, totalRuns: 1 }
  };

  assert.equal(syncMetaFromLegacy(metaSave, {
    shards: 11,
    totalKills: 42,
    totalRuns: 3
  }), metaSave);
  assert.deepEqual(metaSave, {
    currencies: { voidShards: 11, bossCores: 2 },
    profile: { totalKills: 42, totalRuns: 3 }
  });
});

test("workbench port selection rejects missing and occupied ports", () => {
  assert.equal(canUseWorkbenchPort(undefined), false);
  assert.equal(canUseWorkbenchPort({ occupiedByNodeId: "node" }), false);
  assert.equal(canUseWorkbenchPort({ occupiedByNodeId: null }), true);
});

test("combat run build state is adopted into the preview run before checkpointing", () => {
  const previewRun = createRunState({ seed: 1 });
  const combatRun = createRunState({ seed: 2 });
  combatRun.assembly = { version: 1, shipFrameId: "vesper", rootNodeId: "root", nodesById: { root: { nodeId: "root" } }, portsById: {} };
  combatRun.inventory = [{ instanceId: "item-1", definitionId: "railgun" }];
  combatRun.pendingAssemblyItems = [{ pendingMountId: "pending-1" }];
  combatRun.activeBlueprintId = "blueprint-1";
  combatRun.resources = { scrap: 23, flux: 4 };
  combatRun.rewardedNodeIds = ["combat-1"];

  const adopted = adoptCombatRunState(previewRun, combatRun);

  assert.equal(adopted, previewRun);
  assert.equal(previewRun.assembly, combatRun.assembly);
  assert.equal(previewRun.inventory, combatRun.inventory);
  assert.deepEqual(previewRun.pendingAssemblyItems, [{ pendingMountId: "pending-1" }]);
  assert.equal(previewRun.activeBlueprintId, "blueprint-1");
  assert.equal(previewRun.resources, combatRun.resources);
  assert.deepEqual(previewRun.rewardedNodeIds, ["combat-1"]);
});

test("adopting is a no-op when the combat run is the preview run (checkpoint resume)", () => {
  const run = createRunState({ seed: 1 });
  run.inventory = [{ instanceId: "item-1" }];
  assert.equal(adoptCombatRunState(run, run), run);
  assert.deepEqual(run.inventory, [{ instanceId: "item-1" }]);
  assert.equal(adoptCombatRunState(null, run), null);
});

test("adopted combat build survives a checkpoint serialize/hydrate round-trip", () => {
  const previewRun = createRunState({ seed: 3 });
  const combatRun = createRunState({ seed: 4 });
  previewRun.consumedOfferIds.push("merchant-offer-1");
  combatRun.assembly = { version: 1, shipFrameId: "vesper", rootNodeId: "root", nodesById: { root: { nodeId: "root", childPortIds: [] } }, portsById: {} };
  combatRun.inventory = [{ instanceId: "item-1", definitionId: "railgun", affixes: [], sockets: [] }];
  adoptCombatRunState(previewRun, combatRun);

  const services = { marker: true };
  const hydrated = hydrateCheckpointRun(serializeCheckpointRun(previewRun), services);

  assert.equal(hydrated.assembly.shipFrameId, "vesper");
  assert.equal(hydrated.assembly.nodesById.root.nodeId, "root");
  assert.equal(hydrated.inventory[0].definitionId, "railgun");
  assert.deepEqual(hydrated.consumedOfferIds, ["merchant-offer-1"]);
  assert.equal(hydrated.services, services);
});

test("fresh campaigns clear pending checkpoint resume state", () => {
  const services = { resumeRun: { id: "checkpoint" } };
  assert.equal(resetCampaignResume(services), null);
  assert.equal("resumeRun" in services, false);
});

test("opening a replacement quick mount releases the existing overlay first", () => {
  const calls = [];
  const opened = openReplacingQuickMount({
    active: true,
    close: () => calls.push("close"),
    open: () => { calls.push("open"); return { opened: true }; }
  });

  assert.deepEqual(calls, ["close", "open"]);
  assert.deepEqual(opened, { opened: true });
});

test("opening the first quick mount needs no cleanup", () => {
  let closed = false;
  openReplacingQuickMount({
    active: false,
    close: () => { closed = true; },
    open: () => ({ opened: true })
  });

  assert.equal(closed, false);
});

test("workbench refreshes only while active and unsubscribes cleanly", () => {
  let listener;
  let active = true;
  let renders = 0;
  let unsubscribed = false;
  const unsubscribe = subscribeWorkbenchGeometry({
    events: {
      on(eventName, callback) {
        assert.equal(eventName, "assembly:geometry-ready");
        listener = callback;
        return () => { unsubscribed = true; };
      }
    },
    isActive: () => active,
    render: () => { renders += 1; }
  });

  listener();
  active = false;
  listener();
  unsubscribe();

  assert.equal(renders, 1);
  assert.equal(unsubscribed, true);
});
