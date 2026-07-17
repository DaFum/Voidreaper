import test from "node:test";
import assert from "node:assert/strict";
import { resolveEnemyVisualProfile, ENEMY_VISUAL_PROFILE_IDS } from "../../../src/render/enemies/enemy-visual-profiles.js";

test("resolveEnemyVisualProfile resolves known profiles", () => {
  for (const id of ENEMY_VISUAL_PROFILE_IDS) {
    const profile = resolveEnemyVisualProfile(id);
    assert.equal(profile.id, id, `Successfully resolved ${id}`);
    assert.ok(profile.family, `Profile ${id} has family`);
  }
});

test("resolveEnemyVisualProfile falls back to fallback for unknown profiles", () => {
  const profile = resolveEnemyVisualProfile("unknown-enemy");

  assert.equal(profile.id, "fallback", "Defaults to fallback");
  assert.equal(profile.family, "unknown", "Fallback has unknown family");
  assert.equal(profile.core, "warning", "Fallback has warning core");
});