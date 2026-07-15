import test from "node:test";
import assert from "node:assert/strict";
import { createRunState } from "../../../src/runtime/create-run-state.js";
import { createCampaignRewardService } from "../../../src/features/sectors/campaign-reward-service.js";

const equipment = {
  definitions: [
    { id: "ship", slot: "ship" },
    { id: "phase-shield", slot: "passive" },
    { id: "repair-drone", slot: "active" }
  ],
  values() { return this.definitions; },
  get(id) { return this.definitions.find(definition => definition.id === id) ?? null; }
};

test("combat grants scrap and one item exactly once", () => {
  const events = [];
  const service = createCampaignRewardService({ equipment, eventBus: { emit: (...args) => events.push(args) } });
  const run = createRunState({ seed: 1 });
  const node = { id: "combat-1", type: "combat", seed: 42, danger: 2 };
  const first = service.apply(run, node);
  const second = service.apply(run, node);

  assert.equal(first.applied, true);
  assert.equal(second.applied, false);
  assert.equal(run.inventory.length, 1);
  assert.equal(run.resources.scrap, 20);
  assert.equal(events[0][0], "run-item-acquired");
  assert.equal(events[0][1].run, run);
});

test("elite grants flux and a rare item", () => {
  const service = createCampaignRewardService({ equipment, eventBus: { emit() {} } });
  const run = createRunState({ seed: 2 });
  const result = service.apply(run, { id: "elite-1", type: "elite", seed: 7, danger: 3 });

  assert.equal(result.item.rarity, "rare");
  assert.equal(run.resources.flux, 4);
});

test("extraction persists each discovered module blueprint exactly once", async () => {
  const existing = { source: "older-recovery" };
  const save = { blueprints: { "phase-shield": existing } };
  const events = [];
  const service = createCampaignRewardService({
    equipment,
    eventBus: { emit: (...args) => events.push(args) },
    saveStore: { update: async mutate => { await mutate(save); return save; } }
  });
  const run = createRunState({ seed: 3 });
  run.inventory = [
    { definitionId: "phase-shield" },
    { definitionId: "phase-shield" },
    { definitionId: "repair-drone" },
    { definitionId: "ship" },
    { definitionId: "missing" }
  ];

  const result = await service.extractBlueprints(run);

  assert.deepEqual(result, {
    applied: true,
    definitionIds: ["phase-shield", "repair-drone"]
  });
  assert.equal(save.blueprints["phase-shield"], existing);
  assert.deepEqual(save.blueprints["repair-drone"], {
    source: "campaign-extraction"
  });
  assert.equal(events[0][0], "campaign-blueprints-extracted");
  assert.deepEqual(events[0][1].definitionIds, ["phase-shield", "repair-drone"]);
});

test("extraction without modules writes nothing", async () => {
  let writes = 0;
  const service = createCampaignRewardService({
    equipment,
    eventBus: { emit() {} },
    saveStore: { update: async () => { writes += 1; } }
  });
  const run = createRunState({ seed: 4 });
  run.inventory = [{ definitionId: "ship" }];

  assert.deepEqual(await service.extractBlueprints(run), {
    applied: false,
    definitionIds: []
  });
  assert.equal(writes, 0);
});
