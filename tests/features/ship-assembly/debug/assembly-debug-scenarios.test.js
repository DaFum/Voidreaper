import test from "node:test";
import assert from "node:assert/strict";
import { findMaximumConstructionCandidate, summarizeMaximumConstructionBlockers } from "../../../../src/features/ship-assembly/debug/assembly-debug-scenarios.js";

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

test("maximum construction prioritizes an expandable definition across all ports", () => {
  const leaf = { id: "leaf", assembly: { childPorts: [] } };
  const spine = { id: "spine", assembly: { childPorts: [1, 2, 3] } };
  const candidate = findMaximumConstructionCandidate({
    state: { nodesById: {} }, geometry: {}, ports: [{ portId: "first", branchDepth: 0 }, { portId: "second", branchDepth: 0 }], definitions: [leaf, spine],
    evaluate: ({ moduleProfile, port }) => ({ compatible: moduleProfile.definitionId === "leaf" || port.portId === "second" })
  });

  assert.equal(candidate.port.portId, "second");
  assert.equal(candidate.definition.id, "spine");
});

test("maximum construction reports the contracts blocking remaining pairs", () => {
  const blockers = summarizeMaximumConstructionBlockers({
    state: {}, geometry: {}, ports: [{ portId: "p" }], definitions: [{ id: "d", assembly: {} }],
    evaluate: () => ({ compatible: false, reasons: ["overlap", "size"] })
  });
  assert.deepEqual(blockers, { overlap: 1, size: 1 });
});
