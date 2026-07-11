import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_ENVIRONMENT_THEME_ID,
  ENVIRONMENT_THEMES,
  createDustSpecs,
  createNebulaBlobSpecs,
  createStarSpecs,
  createStreakSpecs,
  environmentThemeIdFor,
  missingRegionThemes,
  resolveEnvironmentTheme
} from "../../src/render/pixi/environment-scene.js";
import { REGION_VISUAL_PALETTES } from "../../src/render/forged-abyss/palettes.js";

test("every region palette has a matching environment theme", () => {
  assert.deepEqual(missingRegionThemes(), []);
  for (const regionId of Object.keys(REGION_VISUAL_PALETTES)) {
    assert.equal(environmentThemeIdFor(regionId), regionId);
  }
});

test("unknown regions fall back to the deep-void theme", () => {
  assert.equal(environmentThemeIdFor("unbekannte-region"), DEFAULT_ENVIRONMENT_THEME_ID);
  assert.equal(environmentThemeIdFor(null), DEFAULT_ENVIRONMENT_THEME_ID);
  assert.equal(resolveEnvironmentTheme("unbekannte-region"), ENVIRONMENT_THEMES[DEFAULT_ENVIRONMENT_THEME_ID]);
});

test("themes carry complete color sets", () => {
  for (const [themeId, theme] of Object.entries(ENVIRONMENT_THEMES)) {
    assert.equal(theme.sky.length, 3, `${themeId} sky stops`);
    assert.ok(theme.nebula.length >= 3, `${themeId} nebula colors`);
    assert.ok(theme.stars.length >= 3, `${themeId} star tints`);
    for (const color of [...theme.sky, ...theme.nebula, ...theme.stars, theme.dust, theme.glow]) {
      assert.match(color, /^#[0-9a-f]{6}$/i, `${themeId} color format`);
    }
  }
});

test("star specs are deterministic and stay in the unit field", () => {
  const first = createStarSpecs({ seed: 7, count: 120 });
  const second = createStarSpecs({ seed: 7, count: 120 });
  assert.deepEqual(first, second);
  assert.equal(first.length, 120);
  for (const star of first) {
    assert.ok(star.x >= 0 && star.x < 1);
    assert.ok(star.y >= 0 && star.y < 1);
    assert.ok(star.depth > 0 && star.depth < 1);
    assert.ok(star.size > 0);
  }
  const other = createStarSpecs({ seed: 8, count: 120 });
  assert.notDeepEqual(first, other);
});

test("nebula blobs use the provided color range and texture bounds", () => {
  const colors = ["#4318b8", "#c77dff", "#ff2d78"];
  const blobs = createNebulaBlobSpecs({ seed: "7:test", colors, textureSize: 512, blobCount: 12 });
  assert.equal(blobs.length, 12);
  for (const blob of blobs) {
    assert.ok(blob.x >= 0 && blob.x < 512);
    assert.ok(blob.y >= 0 && blob.y < 512);
    assert.ok(blob.radius > 0);
    assert.ok(blob.colorIndex >= 0 && blob.colorIndex < colors.length);
    assert.ok(blob.alpha > 0 && blob.alpha < 0.2);
  }
  assert.deepEqual(blobs, createNebulaBlobSpecs({ seed: "7:test", colors, textureSize: 512, blobCount: 12 }));
});

test("dust and streak specs are deterministic", () => {
  assert.deepEqual(createDustSpecs({ seed: 7 }), createDustSpecs({ seed: 7 }));
  const streaks = createStreakSpecs({ seed: 7 });
  assert.deepEqual(streaks, createStreakSpecs({ seed: 7 }));
  for (const streak of streaks) {
    assert.ok(streak.period > streak.duration, "streaks must pause between passes");
  }
});
