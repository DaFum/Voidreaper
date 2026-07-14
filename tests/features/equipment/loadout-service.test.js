import test from "node:test";
import assert from "node:assert/strict";
import * as loadoutService from "../../../src/features/equipment/loadout-service.js";

const { createLoadoutItem, createStarterLoadout, deriveEquipmentCatalogEntries, resolvePrimaryLoadout } = loadoutService;

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

test("equipment catalog state derives unlocks and every equipped slot", () => {
  assert.equal(typeof deriveEquipmentCatalogEntries, "function");
  const definitions = [
    { id: "locked", slot: "passive" },
    { id: "equipped", slot: "passive" }
  ];
  const loadout = {
    slots: {
      passive: [{ definitionId: "equipped" }, null, { definitionId: "equipped" }]
    }
  };

  assert.deepEqual(
    deriveEquipmentCatalogEntries(definitions, {
      isUnlocked: definition => definition.id !== "locked",
      loadout
    }),
    [
      { definition: definitions[0], state: "locked", equippedSlots: [], unlocked: false },
      {
        definition: definitions[1],
        state: "equipped",
        equippedSlots: [{ slot: "passive", index: 0 }, { slot: "passive", index: 2 }],
        unlocked: true
      }
    ]
  );
});
