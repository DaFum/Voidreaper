export const DEFENSIVE_AFFIXES = Object.freeze([
  { id: "reinforced", name: "Reinforced", families: ["passive", "utility", "reactor"], tags: ["Hull"], weight: 8, modifier: { targetStat: "max-hull", operation: "add", range: [8, 28], integer: true } },
  { id: "insulated", name: "Insulated", families: ["passive", "reactor"], tags: ["Cooling"], weight: 7, modifier: { targetStat: "cooling-rate", operation: "add", range: [1, 4] } },
  { id: "grounded", name: "Grounded", families: ["passive", "utility"], tags: ["Stability"], weight: 5, modifier: { targetStat: "fault-resistance", operation: "add", range: [0.03, 0.12] } },
  { id: "phase-woven", name: "Phase-Woven", families: ["passive"], tags: ["Dodge", "Shield"], weight: 3, trigger: "dodge-used" }
]);
