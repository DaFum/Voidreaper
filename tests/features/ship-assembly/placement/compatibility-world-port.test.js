import test from "node:test";
import assert from "node:assert/strict";
import { createCompatibilityService } from "../../../../src/features/ship-assembly/placement/compatibility-service.js";
import { buildPreviewBounds } from "../../../../src/features/ship-assembly/geometry/hit-shape-preview.js";

test("compatibility evaluates child-port collision bounds in world coordinates", () => {
  const service = createCompatibilityService();
  const state = { nodesById: { root: {}, parent: {} } };
  const port = { portId: "child-port", parentNodeId: "parent", localPosition: { x: 20, y: 0 }, direction: { x: 1, y: 0 }, sizeClass: "S", mountType: "dorsal", loadCapacity: 4, energyClass: "standard", branchDepth: 1, occupiedByNodeId: null };
  const geometrySnapshot = {
    nodes: [{ nodeId: "parent", worldPosition: { x: 100, y: 0 }, worldRotation: 0 }],
    occupiedBounds: [{ ownerId: "root", minX: -20, minY: -20, maxX: 20, maxY: 20 }],
    previewBounds: buildPreviewBounds
  };
  const result = service.evaluate({ state, port, geometrySnapshot, moduleProfile: { sizeClass: "S", mountTypes: ["dorsal"], loadDemand: 1, energyClass: "standard" } });

  assert.equal(result.compatible, true);
  assert.deepEqual(result.candidate.center, { x: 120, y: 0 });
});
