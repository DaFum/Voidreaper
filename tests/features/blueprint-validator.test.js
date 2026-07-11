import test from "node:test";
import assert from "node:assert/strict";
import { validateBlueprint } from "../../src/features/ship-assembly/blueprints/blueprint-validator.js";

const options = { knownShipFrameIds: new Set(["frame-a"]) };
const node = (id, parent = null) => ({ blueprintNodeId: id, parentBlueprintNodeId: parent });

test("a well-formed tree validates without issues", () => {
  const result = validateBlueprint({ shipFrameId: "frame-a", nodes: [node("root"), node("a", "root"), node("b", "a")] }, options);
  assert.equal(result.valid, true);
  assert.deepEqual(result.issues, []);
  assert.equal(result.blueprint.nodes.length, 3);
});

test("cycles are flagged for every node caught in or leading into the cycle", () => {
  const result = validateBlueprint({ shipFrameId: "frame-a", nodes: [node("root"), node("a", "b"), node("b", "a"), node("c", "a")] }, options);
  assert.deepEqual(result.issues.filter(issue => issue.type === "cycle").map(issue => issue.nodeId).sort(), ["a", "b", "c"]);
  assert.deepEqual(result.blueprint.nodes.map(item => item.blueprintNodeId), ["root"]);
});

test("nodes whose ancestor chain dangles at a missing parent are dropped, not kept", () => {
  const result = validateBlueprint({ shipFrameId: "frame-a", nodes: [node("root"), node("b", "missing"), node("c", "b"), node("d", "c")] }, options);
  assert.deepEqual(result.issues.filter(issue => issue.type === "missing-parent").map(issue => issue.nodeId).sort(), ["b", "c", "d"]);
  assert.deepEqual(result.blueprint.nodes.map(item => item.blueprintNodeId), ["root"]);
  assert.equal(result.repaired, true);
});

test("memoized verdicts keep deep chains linear and still validate correctly", () => {
  const nodes = [node("n0")];
  for (let i = 1; i < 5000; i++) nodes.push(node(`n${i}`, `n${i - 1}`));
  const result = validateBlueprint({ shipFrameId: "frame-a", nodes }, options);
  assert.equal(result.valid, true);
  assert.equal(result.blueprint.nodes.length, 5000);
});
