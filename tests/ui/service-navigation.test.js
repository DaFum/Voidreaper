import test from "node:test";
import assert from "node:assert/strict";
import { canAffordOffer } from "../../src/ui/screens/merchant-screen.js";
import { isSectorNodeInteractive } from "../../src/ui/components/sector-node.js";

test("flux offers require enough flux", () => {
  assert.equal(canAffordOffer({ scrap: 99, flux: 6 }, { currency: "flux", price: 36 }), false);
  assert.equal(canAffordOffer({ scrap: 0, flux: 36 }, { currency: "flux", price: 36 }), true);
});

test("scrap offers require enough scrap", () => {
  assert.equal(canAffordOffer({ scrap: 11, flux: 99 }, { price: 12 }), false);
  assert.equal(canAffordOffer({ scrap: 12, flux: 0 }, { price: 12 }), true);
});

test("corrupted offers remain available because they cost corruption instead of currency", () => {
  assert.equal(canAffordOffer({ scrap: 0, flux: 0 }, { corrupted: true, price: 999 }), true);
});

test("only reachable sector nodes are interactive", () => {
  assert.equal(isSectorNodeInteractive("reachable"), true);
  assert.equal(isSectorNodeInteractive("visited"), false);
  assert.equal(isSectorNodeInteractive("locked"), false);
});
