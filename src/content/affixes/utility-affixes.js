export const UTILITY_AFFIXES = Object.freeze([
  { id: "efficient", name: "Efficient", families: ["utility", "active", "reactor"], tags: ["Energy"], weight: 8, modifier: { targetStat: "energy-regeneration", operation: "add", range: [1, 4] } },
  { id: "magnetic", name: "Magnetic", families: ["utility", "passive"], tags: ["Pickup"], weight: 7, modifier: { targetStat: "pickup-radius", operation: "add", range: [12, 45] } },
  { id: "stabilized", name: "Stabilized", families: ["utility", "active"], tags: ["Stability"], weight: 5, modifier: { targetStat: "corruption-gain", operation: "multiply", range: [0.82, 0.95] } },
  { id: "cartographic", name: "Cartographic", families: ["utility"], tags: ["Navigation"], weight: 2, effect: "reveal-node" }
]);
