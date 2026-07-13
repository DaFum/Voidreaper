import test from "node:test";
import assert from "node:assert/strict";
import { resolvePortWorldTransform, rotationForPortDirection } from "../../../../src/features/ship-assembly/geometry/port-world-transform.js";

test("module forward axis aligns with the port direction", () => {
  assert.equal(rotationForPortDirection({ x: 0, y: 1 }), 0);
  assert.equal(rotationForPortDirection({ x: 1, y: 0 }), -Math.PI / 2);
});

test("child ports are resolved through their parent world transform", () => {
  const geometry = { nodes: [{ nodeId: "parent", worldPosition: { x: 100, y: 50 }, worldRotation: Math.PI / 2 }] };
  const port = { parentNodeId: "parent", localPosition: { x: 10, y: 0 }, direction: { x: 1, y: 0 } };
  const result = resolvePortWorldTransform(port, geometry);

  assert.ok(Math.abs(result.position.x - 100) < 1e-9);
  assert.ok(Math.abs(result.position.y - 60) < 1e-9);
  assert.ok(Math.abs(result.direction.x) < 1e-9);
  assert.ok(Math.abs(result.direction.y - 1) < 1e-9);
});
