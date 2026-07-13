import test from "node:test";
import assert from "node:assert/strict";
import { migrateAssemblyPortLayout } from "../../../../src/features/ship-assembly/model/assembly-layout-migration.js";

test("checkpoint assemblies receive canonical root and child port transforms", () => {
  const state = {
    structuralRevision: 4,
    rootNodeId: "root",
    nodesById: {
      root: { nodeId: "root", definitionId: "vesper" },
      module: { nodeId: "module", definitionId: "railgun", parentNodeId: "root", parentPortId: "root-port", localPosition: { x: -46, y: 0 }, localRotation: 0 },
      leaf: { nodeId: "leaf", definitionId: "leaf", parentNodeId: "module", parentPortId: "child-port", localPosition: { x: 0, y: -34 }, localRotation: 0 }
    },
    portsById: {
      "root-port": { portId: "root-port", parentNodeId: "root", key: "left", direction: { x: -1, y: 0 }, localPosition: { x: -46, y: 0 }, occupiedByNodeId: "module" },
      "child-port": { portId: "child-port", parentNodeId: "module", key: "micro-port", direction: { x: 0, y: -1 }, localPosition: { x: 0, y: -34 }, occupiedByNodeId: "leaf" }
    }
  };
  const equipment = { requireAssemblyProfile: () => ({ childPorts: [{ key: "micro-port", direction: { x: 0, y: 1 }, localPosition: { x: 0, y: 42 } }] }) };

  assert.equal(migrateAssemblyPortLayout(state, equipment), true);
  assert.deepEqual(state.portsById["root-port"].localPosition, { x: -72, y: 0 });
  assert.deepEqual(state.nodesById.module.localPosition, { x: -72, y: 0 });
  assert.deepEqual(state.portsById["child-port"].localPosition, { x: 0, y: 42 });
  assert.deepEqual(state.nodesById.leaf.localPosition, { x: 0, y: 42 });
  assert.equal(state.structuralRevision, 5);
});
