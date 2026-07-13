import test from "node:test";
import assert from "node:assert/strict";
import { resolvePrimaryLoadout } from "../../../src/features/equipment/loadout-service.js";

test("old profiles without a loadouts container receive an empty primary loadout", () => {
  const loadout = resolvePrimaryLoadout({});
  assert.ok(loadout.slots.ship);
  assert.equal(loadout.slots.ship[0], null);
});

test("existing primary loadouts remain unchanged", () => {
  const primary = { slots: { ship: [{ definitionId: "vesper" }] } };
  assert.equal(resolvePrimaryLoadout({ loadouts: { primary } }), primary);
});
