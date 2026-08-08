import test from "node:test";
import assert from "node:assert/strict";
import { resolveEnemyVisualProfile, ENEMY_VISUAL_PROFILE_IDS } from "../../../src/render/enemies/enemy-visual-profiles.js";
import { renderForgedEnemy } from "../../../src/render/enemies/enemy-renderer.js";

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

test("renderForgedEnemy renders all built-in profiles without throwing", () => {
  const ctx = {
    save: test.mock.fn(),
    restore: test.mock.fn(),
    beginPath: test.mock.fn(),
    closePath: test.mock.fn(),
    moveTo: test.mock.fn(),
    lineTo: test.mock.fn(),
    stroke: test.mock.fn(),
    fill: test.mock.fn(),
    arc: test.mock.fn(),
    ellipse: test.mock.fn(),
    translate: test.mock.fn(),
    rotate: test.mock.fn(),
    scale: test.mock.fn(),
    setLineDash: test.mock.fn(),
    createRadialGradient: test.mock.fn(() => ({
      addColorStop: test.mock.fn()
    })),
    createLinearGradient: test.mock.fn(() => ({
      addColorStop: test.mock.fn()
    })),
    clip: test.mock.fn(),
    rect: test.mock.fn(),
    strokeRect: test.mock.fn(),
    fillRect: test.mock.fn(),
    fillText: test.mock.fn(),
    measureText: test.mock.fn(() => ({ width: 0 })),
  };

  const options = {
    reducedMotion: false,
    frozen: false,
    target: null,
    shade: (color) => color,
  };

  for (const id of ENEMY_VISUAL_PROFILE_IDS) {
    const enemy = {
      type: id,
      r: 20,
      color: "#ff0000",
      vx: 0,
      vy: 1,
      birth: 0,
      hp: 100,
      maxHp: 100,
      elite: id === "tank" ? { tint: "#ffff00" } : null,
      boss: id === "boss",
      shielded: id === "orbiter",
      __visualSeed: 42,
    };

    assert.doesNotThrow(() => {
      renderForgedEnemy(ctx, enemy, options);
    }, `renderForgedEnemy should not throw for ${id}`);
  }
});