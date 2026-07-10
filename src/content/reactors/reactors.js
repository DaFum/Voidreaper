const reactor = (id, name, energyCapacity, cooling, tags, effects, options = {}) => ({ id, name, slot: "reactor", energyCost: 0, energyCapacity, cooling, tags: [{ id: "Reactor", value: 1 }, ...tags], effects, faultProfileId: "reactor", unlockSource: "research", ...options });

export const REACTORS = Object.freeze([
  reactor("standard-core", "Standard Core", 100, 10, [{ id: "Energy", value: 1 }], []),
  reactor("furnace-heart", "Furnace Heart", 135, 5, [{ id: "Heat", value: 3 }], ["reactor-furnace-heart"]),
  reactor("cold-star", "Cold Star", 88, 18, [{ id: "Cooling", value: 3 }], ["reactor-cold-star"]),
  reactor("grave-battery", "Grave Battery", 105, 9, [{ id: "Energy", value: 2 }], ["reactor-kill-energy"], { triggers: [{ id: "grave-charge", event: "enemy-killed", effects: [{ id: "change-resource", resource: "energy", amount: 4 }] }] }),
  reactor("blood-dynamo", "Blood Dynamo", 112, 8, [{ id: "Sacrifice", value: 2 }], ["reactor-hull-energy"], { triggers: [{ id: "blood-charge", event: "player-damaged", effects: [{ id: "change-resource", resource: "energy", amount: 8 }] }] }),
  reactor("void-crucible", "Void Crucible", 145, 7, [{ id: "Void", value: 2 }, { id: "Corruption", value: 2 }], ["reactor-void-crucible"], { corruption: 10 }),
  reactor("pulse-reactor", "Pulse Reactor", 78, 11, [{ id: "Charge", value: 2 }], ["reactor-pulse"]),
  reactor("hive-core", "Hive Core", 95, 9, [{ id: "Summon", value: 2 }], ["reactor-summon-energy"], { triggers: [{ id: "hive-charge", event: "tick", effects: [{ id: "change-resource", resource: "energy", amount: 0.1 }] }] }),
  reactor("entropy-coil", "Entropy Coil", 120, 8, [{ id: "Anomaly", value: 2 }], ["reactor-entropy"]),
  reactor("mirror-core", "Mirror Core", 108, 10, [{ id: "Echo", value: 2 }], ["reactor-mirror"]),
  reactor("null-reactor", "Null Reactor", 82, 14, [{ id: "Cooling", value: 2 }, { id: "Stability", value: 2 }], ["reactor-null"], { blocksForbiddenEvolutions: true }),
  reactor("abyssal-heart", "Abyssal Heart", 130, 6, [{ id: "Void", value: 3 }, { id: "Corruption", value: 3 }], ["reactor-abyssal-growth"], { extractable: false, unlockSource: "secret" })
]);
