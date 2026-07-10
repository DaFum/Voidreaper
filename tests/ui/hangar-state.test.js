import test from "node:test";
import assert from "node:assert/strict";
import { resolveCurrencies } from "../../src/ui/screens/hangar-screen.js";

test("currency getters are resolved on every render", () => {
  let voidShards = 90;
  const currencies = () => ({ voidShards });

  assert.equal(resolveCurrencies(currencies).voidShards, 90);
  voidShards = 75;
  assert.equal(resolveCurrencies(currencies).voidShards, 75);
});

test("currency objects remain supported", () => {
  const currencies = { voidShards: 12 };
  assert.equal(resolveCurrencies(currencies), currencies);
});
