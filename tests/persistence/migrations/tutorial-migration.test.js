import test from "node:test";
import assert from "node:assert/strict";
import { createTutorialState } from "../../../src/persistence/migrations/tutorial-migration.js";

test("createTutorialState creates default state correctly", () => {
  const state = createTutorialState();

  assert.equal(state.version, 1);
  assert.equal(state.autoOffer, true, "Defaults to true");
  assert.equal(state.active, null);
  assert.deepEqual(state.completedChapters, {});
  assert.deepEqual(state.skippedChapters, {});
  assert.deepEqual(state.seenSteps, {});
});

test("createTutorialState allows overriding autoOffer", () => {
  const state = createTutorialState({ autoOffer: false });
  assert.equal(state.autoOffer, false, "Uses provided autoOffer");
});