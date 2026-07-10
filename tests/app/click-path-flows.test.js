import test from "node:test";
import assert from "node:assert/strict";
import {
  attemptMerchantPurchase,
  attemptWorkshopAction,
  prepareCheckpointResume,
  syncLegacyVoidShards
} from "../../src/app/click-path-flows.js";

test("merchant rejection keeps the service open and reports the shortage", () => {
  let finished = false;
  let rejected = false;
  const bought = attemptMerchantPurchase({
    merchant: { buy: () => false },
    run: {},
    offer: {},
    finish: () => { finished = true; },
    onRejected: () => { rejected = true; }
  });

  assert.equal(bought, false);
  assert.equal(finished, false);
  assert.equal(rejected, true);
});

test("merchant success finishes the node", () => {
  let finished = false;
  const bought = attemptMerchantPurchase({
    merchant: { buy: () => true },
    run: {},
    offer: {},
    finish: () => { finished = true; }
  });

  assert.equal(bought, true);
  assert.equal(finished, true);
});

test("successful workshop action finishes the node", () => {
  let finished = false;
  const applied = attemptWorkshopAction({
    workshop: { apply: () => true },
    session: {},
    action: "overclock",
    target: {},
    payload: {},
    finish: () => { finished = true; }
  });

  assert.equal(applied, true);
  assert.equal(finished, true);
});

test("rejected workshop action stays open", () => {
  let finished = false;
  const applied = attemptWorkshopAction({
    workshop: { apply: () => false },
    session: {},
    action: "overclock",
    target: {},
    payload: {},
    finish: () => { finished = true; }
  });

  assert.equal(applied, false);
  assert.equal(finished, false);
});

test("checkpoint preparation initializes assembly without consuming the resumed run", () => {
  const services = {};
  const calls = [];
  const run = { id: "checkpoint" };

  prepareCheckpointResume({
    services,
    controller: { attachLegacy: (_game, options) => calls.push(options) },
    game: {},
    run
  });

  assert.deepEqual(calls, [{ sync: false }]);
  assert.equal(services.resumeRun, run);
});

test("void shard synchronization updates legacy state and its visible counter", () => {
  const persistence = { data: { shards: 90 } };
  const counter = { textContent: "90" };
  const root = { querySelector: selector => selector === "#shards0" ? counter : null };

  syncLegacyVoidShards({ persistence, root, currencies: { voidShards: 45 } });

  assert.equal(persistence.data.shards, 45);
  assert.equal(counter.textContent, "45");
});
