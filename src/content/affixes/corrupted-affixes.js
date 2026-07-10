export const CORRUPTED_AFFIXES = Object.freeze([
  { id: "hungry", name: "Hungry", families: ["weapon", "module"], tags: ["Corruption", "Sacrifice"], weight: 2, minimumCorruption: 25, modifier: { targetStat: "damage-multiplier", operation: "multiply", range: [1.25, 1.55] }, downside: "consumes-stability" },
  { id: "whispering", name: "Whispering", families: ["weapon", "utility"], tags: ["Corruption", "Critical"], weight: 2, minimumCorruption: 50, modifier: { targetStat: "crit-chance", operation: "add", range: [0.15, 0.35] }, downside: "target-drift" },
  { id: "inverted", name: "Inverted", families: ["passive", "reactor"], tags: ["Corruption", "Shield"], weight: 1, minimumCorruption: 50, effect: "shield-inversion", downside: "delayed-damage" }
]);
