import test from "node:test";
import assert from "node:assert/strict";
import {
  createGameController,
  createRootPortPosition,
  equippedAssemblyItems,
  resolveRunLoadout,
  shouldSyncLegacyRun,
} from "../../src/app/game-controller.js";

test("normal legacy attachment synchronizes the run", () => {
  assert.equal(shouldSyncLegacyRun(), true);
  assert.equal(shouldSyncLegacyRun({}), true);
});

test("checkpoint preparation may initialize services without synchronizing stale game state", () => {
  assert.equal(shouldSyncLegacyRun({ sync: false }), false);
});

test("new runs consume the current persistent primary loadout", () => {
  const loadout = { slots: { ship: [{ definitionId: "bastion" }] } };
  assert.equal(resolveRunLoadout({ primaryLoadout: () => loadout }), loadout);
});

test("run loadout falls back to the canonical starter loadout", () => {
  assert.equal(resolveRunLoadout({}).slots.ship[0].definitionId, "vesper");
});

test("run assembly candidates exclude the ship and empty slots", () => {
  const loadout = {
    slots: {
      ship: [{ definitionId: "vesper" }],
      "primary-weapon": [{ definitionId: "railgun" }],
      passive: [null, { definitionId: "phase-shield" }],
    },
  };
  assert.deepEqual(
    equippedAssemblyItems(loadout).map((item) => item.definitionId),
    ["railgun", "phase-shield"],
  );
});

test("root port position scales direction by 72", () => {
  assert.deepEqual(createRootPortPosition({ direction: { x: -1, y: 0.15 } }), {
    x: -72,
    y: 10.799999999999999,
  });
});

test("inspectorModel evaluates synergies without throwing TypeError when tag engine expects totals map container", () => {
  let passedTagCollection = null;
  const mockServices = {
    tags: {
      resolve: (tagCollection, context) => {
        passedTagCollection = tagCollection;
        // Verify tagCollection is the object { totals, provenance } so tags.totals.get(...) works
        return {
          active: [],
          near: [],
          blocked: [],
          testResult: tagCollection.totals?.get("Kinetic") ?? 0,
        };
      },
    },
    evolutions: {
      evaluate: (context) => {
        // Verify context.tags is a Map instance (tagTotals)
        assert.ok(context.tags instanceof Map);
        return [];
      },
    },
  };

  const controller = createGameController(mockServices);
  const mockGame = { upgradeCounts: { dmg: 1 } };
  const model = controller.inspectorModel(mockGame);

  assert.ok(passedTagCollection);
  assert.ok(passedTagCollection.totals instanceof Map);
  assert.ok(passedTagCollection.provenance instanceof Map);
  assert.ok(model.tags instanceof Map);
  assert.equal(model.synergies.testResult, 0);
});
