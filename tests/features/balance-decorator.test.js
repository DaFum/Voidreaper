import test from "node:test";
import assert from "node:assert/strict";
import { calculateVisualImbalance } from "../../src/features/ship-assembly/geometry/balance-decorator.js";

test("calculateVisualImbalance", async (t) => {
  await t.test("returns 0 for an empty array of nodes", () => {
    assert.equal(calculateVisualImbalance([]), 0);
  });

  await t.test("calculates 0 imbalance for a perfectly symmetrical layout", () => {
    const nodes = [
      { worldPosition: { x: -10 }, visualMass: 5 },
      { worldPosition: { x: 10 }, visualMass: 5 },
      { worldPosition: { x: 0 }, visualMass: 10 }
    ];
    assert.equal(calculateVisualImbalance(nodes), 0);
  });

  await t.test("calculates positive or negative imbalance for an asymmetrical layout", () => {
    const nodesLeftHeavy = [
      { worldPosition: { x: -10 }, visualMass: 10 },
      { worldPosition: { x: 10 }, visualMass: 5 }
    ];
    assert.equal(calculateVisualImbalance(nodesLeftHeavy), -50);

    const nodesRightHeavy = [
      { worldPosition: { x: -5 }, visualMass: 5 },
      { worldPosition: { x: 10 }, visualMass: 10 }
    ];
    assert.equal(calculateVisualImbalance(nodesRightHeavy), 75);
  });

  await t.test("clamps visual mass to a minimum of 1", () => {
    const nodes = [
      { worldPosition: { x: 10 }, visualMass: 0 }, // Expected to behave as visualMass: 1
      { worldPosition: { x: -5 }, visualMass: -5 } // Expected to behave as visualMass: 1
    ];

    // (10 * 1) + (-5 * 1) = 5
    assert.equal(calculateVisualImbalance(nodes), 5);
  });
});
