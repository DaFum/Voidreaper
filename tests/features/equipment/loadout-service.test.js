import test from "node:test";
import assert from "node:assert/strict";
import { createLoadoutItem, createStarterLoadout, resolvePrimaryLoadout } from "../../../src/features/equipment/loadout-service.js";

test("new profiles receive the three unlocked starter components", () => {
  const loadout = createStarterLoadout();
  assert.equal(loadout.slots.ship[0].definitionId, "vesper");
  assert.equal(loadout.slots["primary-weapon"][0].definitionId, "railgun");
  assert.equal(loadout.slots.reactor[0].definitionId, "standard-core");
});

test("old profiles without a loadouts container receive the starter loadout", () => {
  assert.equal(resolvePrimaryLoadout({}).slots.ship[0].definitionId, "vesper");
});

test("loadout selections receive stable slot-specific instance ids", () => {
  assert.deepEqual(createLoadoutItem("passive", 2, "phase-shield"), {
    instanceId: "loadout-passive-2-phase-shield",
    definitionId: "phase-shield"
  });
});

test("existing primary loadouts remain unchanged", () => {
  const primary = { slots: { ship: [{ definitionId: "vesper" }] } };
  assert.equal(resolvePrimaryLoadout({ loadouts: { primary } }), primary);
});
