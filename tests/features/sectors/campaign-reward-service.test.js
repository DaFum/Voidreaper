import test from "node:test";
import assert from "node:assert/strict";
import { createRunState } from "../../../src/runtime/create-run-state.js";
import { createCampaignRewardService } from "../../../src/features/sectors/campaign-reward-service.js";

const equipment = {
  values: () => [
    { id: "ship", slot: "ship" },
    { id: "phase-shield", slot: "passive" },
    { id: "repair-drone", slot: "active" }
  ]
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
