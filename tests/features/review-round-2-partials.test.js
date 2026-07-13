import test from "node:test";
import assert from "node:assert/strict";
import { createEffectRegistry } from "../../src/features/effects/effect-registry.js";
import { SHIP_EFFECT_IDS, REACTOR_EFFECT_IDS } from "../../src/content/effects/latent-effect-manifest.js";
import { describeStability } from "../../src/features/equipment/item-stability.js";
import { createPrototypeVault } from "../../src/features/inventory/prototype-vault.js";
import { createSalvageMissionService } from "../../src/features/salvage/salvage-mission-service.js";
import { createMerchantService } from "../../src/features/merchant/merchant-service.js";

// M25 — latent effects are quiet no-ops, unknown ids still warn

test("M25: declared latent effect executes as a silent no-op", () => {
  const registry = createEffectRegistry();
  registry.declareLatent([...SHIP_EFFECT_IDS, ...REACTOR_EFFECT_IDS]);
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = message => warnings.push(message);
  try {
    assert.equal(registry.execute({ id: "ship-bastion-entrench" }, {}), null);
    assert.equal(warnings.length, 0);
    assert.equal(registry.execute({ id: "ship-bastion-entrensh-typo" }, {}), null);
    assert.equal(warnings.length, 1);
  } finally {
    console.warn = originalWarn;
  }
});

test("M25: registering a real handler takes precedence over the latent declaration", () => {
  const registry = createEffectRegistry();
  registry.declareLatent(["reactor-pulse"]);
  registry.register("reactor-pulse", () => "handled");
  assert.equal(registry.execute({ id: "reactor-pulse" }, {}), "handled");
});

// L14 — stability domain unified on numbers with derived labels

test("L14: describeStability derives labels from numeric stability and corruption", () => {
  assert.equal(describeStability({ stability: 100 }), "stable");
  assert.equal(describeStability({ stability: 45 }), "damaged");
  assert.equal(describeStability({ stability: 100, corruptionLevel: 80 }), "corrupted");
  assert.equal(describeStability({}), "stable");
  assert.equal(describeStability({ stability: "damaged" }), "damaged"); // legacy saved string
  // corruption outranks a legacy string label and untouched numeric stability
  assert.equal(describeStability({ stability: "stable", corruptionLevel: 80 }), "corrupted");
  assert.equal(describeStability({ stability: 100, corruption: 80 }), "corrupted");
});

// merchant reroll — counter-derived seeds must produce fresh offers per paid click

test("merchant reroll derives a new seed (and offer set) on every paid reroll", () => {
  const merchant = createMerchantService({
    modules: Array.from({ length: 12 }, (_, index) => ({ id: `module-${index}`, rarity: "common", itemPower: 10 + index })),
    weapons: [{ id: "weapon-a", rarity: "common", itemPower: 20 }],
    reactors: [{ id: "reactor-a", rarity: "common", energyCost: 10 }],
    currencyService: { spend: () => true }
  });
  const run = {};
  const keyOf = offers => offers.map(offer => offer.offerId).join("|");
  const base = merchant.roll(7, 0, 1);
  const first = merchant.reroll(run, 7, 0, 1);
  const second = merchant.reroll(run, 7, 0, 1);
  assert.notEqual(keyOf(first), keyOf(base));
  assert.notEqual(keyOf(second), keyOf(first));
  // string seeds get a counter-suffixed cache key as well
  const stringFirst = merchant.reroll(run, "node-3", 0, 1);
  const stringSecond = merchant.reroll(run, "node-3", 0, 1);
  assert.notEqual(keyOf(stringSecond), keyOf(stringFirst));
});

test("merchant reroll is refused (and rolls nothing) without scrap", () => {
  const merchant = createMerchantService({ modules: [], weapons: [], reactors: [], currencyService: { spend: () => false } });
  assert.equal(merchant.reroll({}, 7, 0, 1), null);
});

test("L14: salvage outcomes write numeric stability and the vault filter matches labels", async () => {
  const save = {
    wreckSignals: { "sig-1": { id: "sig-1", status: "pending", itemSnapshot: { instanceId: "item-1", seed: 3, affixes: [] } } },
    inventory: {},
    blueprints: {},
    overflow: {},
    unlocks: {},
    currencies: { salvageFragments: 0 }
  };
  const service = createSalvageMissionService({ update: async apply => apply(save) });
  const mission = { signalId: "sig-1" };
  await service.apply(mission, "damaged");
  assert.equal(save.inventory["item-1"].stability, 45);

  save.wreckSignals["sig-2"] = { id: "sig-2", status: "pending", itemSnapshot: { instanceId: "item-2", seed: 4, affixes: [] } };
  await service.apply({ signalId: "sig-2" }, "corrupted");
  assert.equal(typeof save.inventory["item-2"].stability, "undefined");
  assert.ok(save.inventory["item-2"].corruptionLevel >= 75);

  const vault = createPrototypeVault(save);
  assert.deepEqual(vault.filter({ stability: "damaged" }).map(item => item.instanceId), ["item-1"]);
  assert.deepEqual(vault.filter({ stability: "corrupted" }).map(item => item.instanceId), ["item-2"]);
});
