import test from "node:test";
import assert from "node:assert/strict";
import { createEquipmentRegistry } from "../../../src/features/equipment/equipment-registry.js";

const createValidDef = () => ({
  id: "test-item",
  name: "Test Item",
  description: "A test item",
  slot: "passive",
  energyCost: 1,
  tags: ["tag1"],
  effects: [{ id: "effect1" }],
  faultProfileId: "fault1"
});

test("equipment registry registers valid definition", () => {
  const registry = createEquipmentRegistry();
  registry.register(createValidDef());
});

test("equipment registry throws when tags is not an array", () => {
  const registry = createEquipmentRegistry();
  const invalidTagsDef = { ...createValidDef(), tags: "not-an-array" };
  assert.throws(() => {
    registry.register(invalidTagsDef);
  }, /tags and effects must be arrays/);
});

test("equipment registry throws when effects is not an array", () => {
  const registry = createEquipmentRegistry();
  const invalidEffectsDef = { ...createValidDef(), effects: "not-an-array" };
  assert.throws(() => {
    registry.register(invalidEffectsDef);
  }, /tags and effects must be arrays/);
});
