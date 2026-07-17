import test from "node:test";
import assert from "node:assert/strict";
import { resolveRegionVisualProfile, REGION_VISUAL_PROFILE_IDS } from "../../../src/render/regions/region-visual-profiles.js";

test("resolveRegionVisualProfile resolves known profiles", () => {
  for (const id of REGION_VISUAL_PROFILE_IDS) {
    const profile = resolveRegionVisualProfile(id);
    assert.equal(profile.id, id, `Successfully resolved ${id}`);
    assert.ok(profile.palette, `Profile ${id} has palette`);
    assert.ok(profile.motifs, `Profile ${id} has motifs`);
  }
});

test("resolveRegionVisualProfile falls back to shattered-approach for unknown profiles", () => {
  const profile = resolveRegionVisualProfile("unknown-region");

  assert.equal(profile.id, "shattered-approach", "Defaults to shattered-approach");
  assert.ok(profile.palette, "Fallback has palette");
});