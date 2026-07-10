export const OFFENSIVE_AFFIXES = Object.freeze([
  { id: "razor", name: "Razor", families: ["weapon", "passive"], tags: ["Kinetic", "Projectile"], weight: 8, modifier: { targetStat: "damage-multiplier", operation: "add", range: [0.08, 0.22] } },
  { id: "accelerated", name: "Accelerated", families: ["weapon"], tags: ["Projectile", "Cooldown"], weight: 7, modifier: { targetStat: "fire-rate", operation: "multiply", range: [1.06, 1.18] } },
  { id: "piercing", name: "Piercing", families: ["weapon"], tags: ["Pierce"], weight: 5, modifier: { targetStat: "pierce", operation: "add", range: [1, 2], integer: true } },
  { id: "volatile", name: "Volatile", families: ["weapon", "passive"], tags: ["Explosive", "Heat"], weight: 4, modifier: { targetStat: "damage-multiplier", operation: "multiply", range: [1.12, 1.3] } },
  { id: "resonant", name: "Resonant", families: ["active", "passive"], tags: ["Echo", "Critical"], weight: 3, trigger: "critical-hit" }
]);
