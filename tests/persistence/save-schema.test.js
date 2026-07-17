import test from "node:test";
import assert from "node:assert/strict";
import { createDefaultSave, CURRENT_SAVE_VERSION } from "../../src/persistence/save-schema.js";

test("createDefaultSave creates a save object matching meta defaults", () => {
  const save = createDefaultSave();

  assert.equal(save.saveVersion, CURRENT_SAVE_VERSION, "saveVersion should match CURRENT_SAVE_VERSION");
  assert.equal(typeof save.profile.createdAt, "string", "Should generate a creation date string");
  assert.equal(save.legacy.best, 0, "Should have legacy structure");
  assert.equal(save.unlocks.vesper, true, "Should force unlock vesper");
  assert.equal(save.unlocks.railgun, true, "Should force unlock railgun");
  assert.equal(save.unlocks["standard-core"], true, "Should force unlock standard-core");
  assert.equal(save.settings.crt, true, "Should have default settings");
  assert.equal(save.checkpoint, null, "Checkpoint should be null");
  assert.deepEqual(save.migrationHistory, [], "Migration history should be empty array");
  assert.deepEqual(save.migrationBackups, {}, "Migration backups should be empty object");
});