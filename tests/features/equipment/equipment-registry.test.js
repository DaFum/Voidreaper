import test from "node:test";
import assert from "node:assert/strict";
import { createEquipmentRegistry } from "../../../src/features/equipment/equipment-registry.js";

test("equipment registry validates tags and effects as arrays", () => {
  const registry = createEquipmentRegistry();

  // Valid definition
  const validDef = {
    id: "test-item",
    name: "Test Item",
    description: "A test item",
    slot: "passive",
    energyCost: 1,
    tags: ["tag1"],
    effects: [{ id: "effect1" }],
    faultProfileId: "fault1"
  };

  assert.doesNotThrow(() => {
    registry.register(validDef);
  });

  // Invalid tags
  const invalidTagsDef = { ...validDef, tags: "not-an-array" };
  assert.throws(() => {
    registry.register(invalidTagsDef);
  }, /tags and effects must be arrays/);

  // Invalid effects
  const invalidEffectsDef = { ...validDef, effects: "not-an-array" };
  assert.throws(() => {
    registry.register(invalidEffectsDef);
  }, /tags and effects must be arrays/);
});
