import test from "node:test";
import assert from "node:assert/strict";
import { createMerchantService } from "../../src/features/merchant/merchant-service.js";
import { createWeaponController } from "../../src/features/combat/weapon-controller.js";
import { createCorruptionState, createCorruptionSystem } from "../../src/features/corruption/corruption-system.js";
import { createHeatState, createHeatSystem } from "../../src/features/heat/heat-system.js";
import { createFlightProfileService } from "../../src/features/ship-assembly/flight/flight-profile-service.js";
import { createRepairService } from "../../src/features/ship-assembly/damage/repair-service.js";
import { REPAIR_ACTIONS } from "../../src/content/ship-assembly/repair-actions.js";
import { createAssemblyGeometryService } from "../../src/features/ship-assembly/geometry/assembly-geometry-service.js";

test("merchant offers can only be purchased once", () => {
  let spends = 0;
  const merchant = createMerchantService({
    modules: [{ id: "module", name: "Module", itemPower: 1 }],
    currencyService: { spend: () => { spends += 1; return true; } }
  });
  const run = { inventory: [], resources: {}, ids: { create: () => "item-1" } };
  const offer = merchant.roll(run, 7)[0];

  assert.equal(merchant.buy(run, offer), true);
  assert.equal(merchant.buy(run, offer), false);
  assert.equal(merchant.buy(run, { ...offer, purchased: false }), false);
  assert.equal(spends, 1);
  assert.equal(merchant.roll(run, 7).some(entry => entry.offerId === offer.offerId), false);
  assert.deepEqual(JSON.parse(JSON.stringify(run)).consumedOfferIds, [offer.offerId]);

  const nextRun = { inventory: [], resources: {}, ids: { create: () => "item-2" } };
  assert.equal(merchant.roll(nextRun, 7).some(entry => entry.offerId === offer.offerId), true);
});

test("weapon telemetry omits an unsupported hardcoded damage figure", () => {
  const controller = createWeaponController({
    effects: { execute: () => null },
    events: { emit() {} },
    stats: {},
    targeting: null
  });
  const adapter = {
    createState: () => ({}), update() {}, fire: () => true,
    onEquip() {}, onUnequip() {}, getTelemetry: () => ({ ready: true })
  };
  controller.equip({ id: "test-weapon", adapter }, { player: {}, enemies: [], rng: {} });

  assert.equal(Object.hasOwn(controller.telemetry(), "damage"), false);
});

test("corruption bookings aggregate by source instead of growing per change", () => {
  const state = createCorruptionState();
  const system = createCorruptionSystem();

  for (let index = 0; index < 100; index += 1) system.change(state, 1, "abyss", index, { allowAbyss: true });

  assert.equal(state.bookings.length, 1);
  assert.deepEqual(system.summary(state).sources, [["abyss", 100]]);
});

test("heat warning survives a frame hitch that expires cooling delay", () => {
  const warnings = [];
  const state = createHeatState();
  const system = createHeatSystem({ eventBus: { emit: event => warnings.push(event) } });
  system.add(state, 90, "reactor");

  system.update(state, 1, { coolingRate: 0 });

  assert.equal(warnings.includes("heat-warning"), true);
});

test("flight placement preview prefers world coordinates for nested ports", () => {
  const service = createFlightProfileService({ geometryService: { getSnapshot: () => null } });

  const preview = service.previewPlacement(
    { localPosition: { x: 3, y: 4 }, worldPosition: { x: 30, y: 40 } },
    { mass: 2 }
  );

  assert.equal(preview.rotationalInertia, 5000);
});

test("repair rolls node state back when invariant publication throws", () => {
  const node = { armorIntegrity: 10, maxArmorIntegrity: 100, coreIntegrity: 100, maxCoreIntegrity: 100, damageState: "intact" };
  const assemblyService = {
    requireNode: () => node,
    transaction(operation) {
      const before = structuredClone(node);
      try { return operation(); }
      catch (error) { Object.assign(node, before); throw error; }
    },
    publishDamageChange() { throw new Error("invariant"); }
  };
  const resources = { scrap: 100, flux: 100 };
  const repairs = createRepairService({ assemblyService, resources });

  assert.throws(() => repairs.apply(REPAIR_ACTIONS.PATCH_ARMOR, "node"), /invariant/);
  assert.equal(node.armorIntegrity, 10);
  assert.deepEqual(resources, { scrap: 100, flux: 100 });
});

test("repair preserves the canonical detached damage state", () => {
  const node = { armorIntegrity: 10, maxArmorIntegrity: 100, coreIntegrity: 0, maxCoreIntegrity: 100, damageState: "detached" };
  const assemblyService = {
    requireNode: () => node,
    transaction: operation => operation(),
    publishDamageChange() {}
  };
  const repairs = createRepairService({ assemblyService, resources: { scrap: 100, flux: 100 } });

  repairs.apply(REPAIR_ACTIONS.PATCH_ARMOR, "node");

  assert.equal(node.damageState, "detached");
});

test("destroy cancels a pending assembly geometry rebuild", () => {
  const originalRequest = globalThis.requestAnimationFrame;
  const originalCancel = globalThis.cancelAnimationFrame;
  let listener;
  let cancelled = null;
  globalThis.requestAnimationFrame = () => 42;
  globalThis.cancelAnimationFrame = id => { cancelled = id; };
  try {
    const service = createAssemblyGeometryService({
      eventBus: { on: (_event, callback) => { listener = callback; return () => {}; } },
      assemblyService: {}
    });
    listener({ structuralRevision: 1 });
    service.destroy();
    assert.equal(cancelled, 42);
  } finally {
    globalThis.requestAnimationFrame = originalRequest;
    globalThis.cancelAnimationFrame = originalCancel;
  }
});
