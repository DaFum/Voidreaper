import { REGION_VISUAL_PALETTES } from "../forged-abyss/palettes.js";

const profile = (id, grid, motifs, density, motion = "drift") => Object.freeze({
  id, palette: REGION_VISUAL_PALETTES[id], grid,
  motifs: Object.freeze(motifs), density, motion
});

export const REGION_VISUAL_PROFILES = Object.freeze({
  "shattered-approach": profile("shattered-approach", "fracture", ["shard", "broken-rail"], .42),
  "furnace-expanse": profile("furnace-expanse", "plates", ["vent", "slag-crack"], .58, "heat"),
  "grave-circuit": profile("grave-circuit", "salvage", ["wreck", "cable"], .64, "static"),
  "null-cathedral": profile("null-cathedral", "cathedral", ["arch", "aperture"], .48, "pulse"),
  "architects-crown": profile("architects-crown", "segments", ["axiom", "ring"], .52, "rotate")
});

export const REGION_VISUAL_PROFILE_IDS = Object.freeze(Object.keys(REGION_VISUAL_PROFILES));
const warned = new Set();

export function resolveRegionVisualProfile(regionId) {
  const profileValue = REGION_VISUAL_PROFILES[regionId];
  if (!profileValue && !warned.has(regionId)) {
    warned.add(regionId);
    console.warn(`[visuals] missing region profile: ${regionId}`);
  }
  return profileValue ?? REGION_VISUAL_PROFILES["shattered-approach"];
}
