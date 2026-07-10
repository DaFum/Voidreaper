import test from "node:test";
import assert from "node:assert/strict";
import { shouldSyncLegacyRun } from "../../src/app/game-controller.js";

test("normal legacy attachment synchronizes the run", () => {
  assert.equal(shouldSyncLegacyRun(), true);
  assert.equal(shouldSyncLegacyRun({}), true);
});

test("checkpoint preparation may initialize services without synchronizing stale game state", () => {
  assert.equal(shouldSyncLegacyRun({ sync: false }), false);
});
