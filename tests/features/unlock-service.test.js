import test from "node:test";
import assert from "node:assert/strict";
import {
  createUnlockService,
  unlockFlagsFromSave
} from "../../src/features/research/unlock-service.js";

test("save unlock flags include persisted component blueprints", () => {
  assert.deepEqual(unlockFlagsFromSave({
    unlocks: { bastion: true, ignored: false },
    blueprints: { "shield-pulse": { source: "campaign-extraction" } }
  }), {
    bastion: true,
    ignored: false,
    "shield-pulse": true
  });
  assert.deepEqual(unlockFlagsFromSave(), {});
});

test("hydrate adds persisted unlock flags without dropping in-session unlocks", () => {
  const unlocks = createUnlockService({ vesper: true, stale: false });
  assert.equal(unlocks.isUnlocked({ id: "vesper" }), true);
  assert.equal(unlocks.isUnlocked({ id: "railgun" }), false);

  unlocks.unlock("session-only", { type: "research" });
  unlocks.hydrate({ railgun: true, bastion: true, ignored: false });

  assert.equal(unlocks.isUnlocked({ id: "railgun" }), true);
  assert.equal(unlocks.isUnlocked({ id: "bastion" }), true);
  assert.equal(unlocks.isUnlocked({ id: "ignored" }), false);
  assert.equal(unlocks.isUnlocked({ id: "session-only" }), true);
  assert.equal(unlocks.isUnlocked({ id: "vesper" }), true);
});

test("hydrate tolerates missing flags", () => {
  const unlocks = createUnlockService();
  unlocks.hydrate();
  assert.equal(unlocks.isUnlocked({ id: "anything" }), false);
});
