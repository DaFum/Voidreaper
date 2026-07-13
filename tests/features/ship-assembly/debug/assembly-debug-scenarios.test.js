import test from "node:test";
import assert from "node:assert/strict";
import { findMaximumConstructionCandidate } from "../../../../src/features/ship-assembly/debug/assembly-debug-scenarios.js";

test("maximum construction skips candidates rejected by compatibility", () => {
  const bad = { id: "bad", assembly: { childPorts: [1, 2] } };
  const good = { id: "good", assembly: { childPorts: [] } };
  const candidate = findMaximumConstructionCandidate({
    state: { nodesById: {} },
    geometry: {},
    ports: [{ portId: "p1", branchDepth: 0 }],
    definitions: [bad, good],
    evaluate: ({ moduleProfile }) => ({ compatible: moduleProfile.definitionId === "good" })
  });

  assert.equal(candidate.definition.id, "good");
});
