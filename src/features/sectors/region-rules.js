import { REGION_BY_ID } from "../../content/sectors/regions.js";

export function getRegionRules(regionId, elapsed = 0) {
  const region = REGION_BY_ID.get(regionId) ?? REGION_BY_ID.get("shattered-approach");
  const rules = { region, heatGain: 0, coolingDrops: 0, wreckDensity: 0, visibility: 1, corruptionOffers: 0, arenaRule: region.rule };
  if (region.rule === "heat") Object.assign(rules, { heatGain: 8, coolingDrops: 2 });
  if (region.rule === "wrecks") Object.assign(rules, { wreckDensity: 12 });
  if (region.rule === "corruption") Object.assign(rules, { visibility: .72, corruptionOffers: 2 });
  if (region.rule === "rotating") rules.arenaRule = ["segments", "gravity", "pulse"][Math.floor(elapsed / 30) % 3];
  return rules;
}
