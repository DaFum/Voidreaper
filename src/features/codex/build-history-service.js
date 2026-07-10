export function createBuildHistoryService(saveStore) {
  return {
    capture(run, result) { return { id: `build-${Date.now()}`, createdAt: new Date().toISOString(), ship: run.loadout?.shipId, weapon: run.loadout?.weaponId, reactor: run.loadout?.reactorId, modules: [...(run.loadout?.moduleIds ?? [])], evolutions: run.build.evolutions.map(entry => entry.id ?? entry), tags: [...(run.build.tags ?? new Map()).entries()], seed: run.seed, result, favorite: false }; },
    async save(build) { return saveStore.update(save => { save.buildHistory[build.id] = structuredClone(build); }); },
    async favorite(id, value = true) { return saveStore.update(save => { if (save.buildHistory[id]) save.buildHistory[id].favorite = value; }); },
    list(save) { return Object.values(save.buildHistory).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
  };
}
