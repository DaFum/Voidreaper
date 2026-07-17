import { createRunRng, hashString } from "../../core/rng.js";
import { NODE_TYPES, normalizeNodeType } from "../../content/sectors/node-types.js";
import { CAMPAIGN_PATHS } from "../../content/campaigns/campaign-paths.js";

let REGIONS = ["shattered-approach", "furnace-expanse", "grave-circuit", "null-cathedral", "architects-crown"];
const TYPE_ROTATION = ["combat", "elite", "salvage", "merchant", "workshop", "anomaly", "recovery"];

function node(rng, regionIndex, layer, index, type, contentVersion) {
  const safeType = normalizeNodeType(type);
  const definition = NODE_TYPES[safeType];
  const danger = Math.min(10, 1 + regionIndex * 2 + layer + (safeType === "elite" ? 2 : 0));
  return {
    id: `r${regionIndex}-l${layer}-n${index}`,
    regionId: REGIONS[regionIndex],
    regionIndex,
    layer,
    index,
    type: safeType,
    danger,
    reward: definition.reward,
    corruptionDelta: definition.corruption,
    informationLevel: definition.hidden ? 0 : 2,
    seed: rng.integer(1, 0x7fffffff),
    contentVersion,
    next: []
  };
}

export function generateSectorMap({ seed, contentVersion = "3.0.0", campaignPathId = "architect" } = {}) {
  const mapSeed = hashString(`${seed ?? 0}:${contentVersion}`);
  const pathDef = CAMPAIGN_PATHS.find(p => p.id === campaignPathId);
  REGIONS = pathDef ? pathDef.regions : ["shattered-approach", "furnace-expanse", "grave-circuit", "null-cathedral", "architects-crown"];
  const rng = createRunRng(mapSeed);
  const regions = REGIONS.map((regionId, regionIndex) => {
    const layers = [];
    for (let layer = 0; layer < 3; layer += 1) {
      const count = rng.integer(2, 3);
      const nodes = Array.from({ length: count }, (_, index) => {
        let type = TYPE_ROTATION[(regionIndex * 3 + layer + index) % TYPE_ROTATION.length];
        if (layer === 1 && regionIndex % 2 === 0 && index === 0) type = "workshop";
        if (layer === 2) type = index === 0 ? "mid-boss" : "extraction";
        return node(rng, regionIndex, layer, index, type, contentVersion);
      });
      layers.push(nodes);
    }
    const boss = node(rng, regionIndex, 3, 0, regionIndex === 4 ? "boss" : "mid-boss", contentVersion);
    layers.push([boss]);
    for (let layer = 0; layer < layers.length - 1; layer += 1) {
      for (const current of layers[layer]) {
        current.next = layers[layer + 1]
          .filter(candidate => !(current.type === "merchant" && candidate.type === "merchant"))
          .map(candidate => candidate.id);
        if (!current.next.length) current.next = [layers[layer + 1][0].id];
      }
    }
    return { id: regionId, index: regionIndex, layers };
  });
  return { seed: mapSeed, sourceSeed: seed ?? 0, contentVersion, regions };
}

const flattenCache = new WeakMap();

export function flattenSectorMap(map) {
  if (!map || !map.regions) return [];
  let flat = flattenCache.get(map);
  if (!flat) {
    flat = map.regions.flatMap(region => region.layers.flat());
    flattenCache.set(map, flat);
  }
  return flat;
}
