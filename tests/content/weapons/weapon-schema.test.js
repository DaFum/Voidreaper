import test from "node:test";
import assert from "node:assert/strict";
import { createWeaponDefinition } from "../../../src/content/weapons/weapon-schema.js";

test("createWeaponDefinition correctly merges default data and validates adapter", () => {
  const adapter = {
    createState: () => {},
    update: () => {},
    fire: () => {},
    onEquip: () => {},
    onUnequip: () => {},
    getTelemetry: () => {}
  };

  const data = { id: "test-weapon", name: "Test Weapon", slot: "special", energyCost: 50 };

  const def = createWeaponDefinition(data, adapter);

  assert.equal(def.id, "test-weapon");
  assert.equal(def.name, "Test Weapon");
  assert.equal(def.slot, "special", "Allows overriding default slot");
  assert.equal(def.energyCost, 50, "Allows overriding default energyCost");
  assert.equal(def.faultProfileId, "weapon-projectile", "Provides default faultProfileId");
  assert.deepEqual(def.effects, [], "Provides default effects");
  assert.equal(def.adapter, adapter, "Assigns validated adapter");
});

test("createWeaponDefinition throws on invalid adapter", () => {
  const invalidAdapter = {
    createState: () => {},
    update: () => {}
  };

  assert.throws(() => createWeaponDefinition({ id: "test-weapon" }, invalidAdapter), { message: "test-weapon missing fire()" });
});