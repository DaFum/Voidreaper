import { createRunRng } from "../../core/rng.js";

export function createSalvageMissionService(saveStore) {
  return {
    create(signal) { const rng = createRunRng(signal.itemSnapshot.seed ?? signal.createdAtRun); const affixes = [...(signal.itemSnapshot.affixes ?? [])].slice(0, 2); return { id: `mission-${signal.id}`, signalId: signal.id, regionId: signal.regionId, path: ["wreck-entry", "hunter-pack", "recovery-forge", "prototype-carrier"].map((type, index) => ({ id: `${signal.id}-${index}`, type, seed: rng.integer(1, 999999) })), enemyAffixes: affixes, boss: { id: "prototype-carrier", carriedItem: signal.itemSnapshot }, modifiers: signal.modifiers, status: "available" }; },
    outcome(mission, performance) { if (!performance.bossDefeated) return "failed"; if (performance.extraction >= 1 && performance.stability >= .75) return "complete"; if (performance.extraction >= 1 && performance.corruption >= 75) return "corrupted"; if (performance.extraction >= 1) return "damaged"; return "blueprint"; },
    async apply(mission, result) { return saveStore.update(save => { const signal = save.wreckSignals[mission.signalId]; if (!signal || signal.status === "recovered") return save; signal.status = "recovered"; signal.result = result; const item = structuredClone(signal.itemSnapshot); if (result === "complete") save.inventory[item.instanceId] = item; if (result === "damaged") save.inventory[item.instanceId] = { ...item, stability: "damaged", durability: 45 }; if (result === "corrupted") save.inventory[item.instanceId] = { ...item, stability: "corrupted", corruption: Math.max(75, item.corruption ?? 0) }; if (result === "blueprint") save.blueprints[item.definitionId ?? item.id] = { sourceSignalId: signal.id }; return save; }); }
  };
}
