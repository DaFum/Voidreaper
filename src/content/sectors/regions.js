export const REGIONS = Object.freeze([
  { id: "shattered-approach", name: "Shattered Approach", palette: ["#12052a", "#04010a"], floor: "clear", enemies: ["drifter", "lancer"], loot: "balanced", audio: "approach", rule: "baseline" },
  { id: "furnace-expanse", name: "Furnace Expanse", palette: ["#35110a", "#080202"], floor: "heat-zones", enemies: ["cinder", "furnace-ram"], loot: "flux", audio: "furnace", rule: "heat" },
  { id: "grave-circuit", name: "Grave Circuit", palette: ["#071f21", "#020708"], floor: "wrecks", enemies: ["scrap-drone", "grave-tender"], loot: "salvage", audio: "grave", rule: "wrecks" },
  { id: "null-cathedral", name: "Null Cathedral", palette: ["#26062f", "#050108"], floor: "distorted", enemies: ["choir", "confessor"], loot: "corrupted", audio: "choir", rule: "corruption" },
  { id: "architects-crown", name: "Architect's Crown", palette: ["#0c1d2d", "#02030a"], floor: "segments", enemies: ["proxy", "axiom"], loot: "prototype", audio: "architect", rule: "rotating" }
]);

export const REGION_BY_ID = new Map(REGIONS.map(region => [region.id, region]));
