import test from "node:test";
import assert from "node:assert/strict";
import { defaultChildPorts } from "../../../../src/features/ship-assembly/content/module-assembly-resolver.js";

test("structural spine ports clear non-parent module geometry", () => {
  const ports = defaultChildPorts({ id: "structure-spine" }, "L");
  assert.equal(ports.find(port => port.key === "branch-forward").localPosition.y, 56);
  assert.equal(Math.abs(ports.find(port => port.key === "branch-port").localPosition.x), 72);
  assert.equal(Math.abs(ports.find(port => port.key === "branch-starboard").localPosition.x), 72);
});

test("medium-module continuation ports extend away from their parent", () => {
  const [port] = defaultChildPorts({ id: "weapon-linear" }, "M");
  assert.deepEqual(port.direction, { x: 0, y: 1 });
  assert.deepEqual(port.localPosition, { x: 0, y: 42 });
});
