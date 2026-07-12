import test from "node:test";
import assert from "node:assert/strict";
import { createHitZone } from "../../../../src/features/ship-assembly/damage/hit-zone-builder.js";

test("createHitZone factory maps inputs and sets enabled: true", () => {
  const inputs = {
    id: "zone-1",
    ownerType: "module",
    ownerId: "mod-abc",
    shape: { kind: "circle", radius: 5 },
    transform: { position: { x: 0, y: 0 }, rotation: 0 },
    priority: 10
  };

  const hitZone = createHitZone(inputs);

  assert.equal(hitZone.id, inputs.id);
  assert.equal(hitZone.ownerType, inputs.ownerType);
  assert.equal(hitZone.ownerId, inputs.ownerId);
  assert.deepEqual(hitZone.shape, inputs.shape);
  assert.deepEqual(hitZone.transform, inputs.transform);
  assert.equal(hitZone.priority, inputs.priority);
  assert.equal(hitZone.enabled, true);
});

test("createHitZone result is frozen", () => {
  const hitZone = createHitZone({
    id: "test",
    ownerType: "core",
    ownerId: "core-1",
    shape: { kind: "circle", radius: 1 },
    transform: { position: { x: 0, y: 0 }, rotation: 0 },
    priority: 1
  });

  assert.ok(Object.isFrozen(hitZone), "The returned hit zone should be frozen");

  assert.throws(() => {
    hitZone.enabled = false;
  }, TypeError);
  assert.equal(hitZone.enabled, true);
});
