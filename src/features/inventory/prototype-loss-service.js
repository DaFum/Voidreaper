export function createPrototypeLossService({ saveStore, wreckSignalService } = {}) {
  function resolve(items, { difficulty, runSnapshot }) {
    const outcome = { removed: [], fragments: 0, wrecks: [] };
    for (const item of items.filter(entry => !entry.secured)) {
      if (difficulty === "initiate" && ["common", "rare"].includes(item.rarity)) continue;
      if (["common", "rare"].includes(item.rarity)) outcome.removed.push(item.instanceId);
      else if (item.rarity === "epic") { outcome.fragments += 12; if ((item.corruptionLevel ?? item.corruption ?? 0) >= 50) outcome.wrecks.push(wreckSignalService.create(item, runSnapshot)); }
      else if (["legendary", "unique"].includes(item.rarity)) { item.prototypeStatus = "lost"; outcome.wrecks.push(wreckSignalService.create(item, runSnapshot)); }
    }
    return outcome;
  }
  return {
    resolve,
    async commitAfterRun(items, context) { const outcome = resolve(items, context); await saveStore.update(save => { for (const id of outcome.removed) delete save.inventory[id]; save.currencies.salvageFragments += outcome.fragments; for (const signal of outcome.wrecks) save.wreckSignals[signal.id] = signal; }); return outcome; }
  };
}
