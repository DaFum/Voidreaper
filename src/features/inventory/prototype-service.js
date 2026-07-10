export function createPrototypeService({ baseMarkLimit = 3 } = {}) {
  return {
    mark(inventory, instanceId, loadoutSources = []) {
      const item = inventory.get(instanceId);
      if (!item || !["prototype", "relic"].includes(item.ownership)) return false;
      const lockerBonus = loadoutSources.some(source => source.id === "prototype-locker") ? 1 : 0;
      const marked = inventory.values().filter(entry => entry.marked);
      if (!item.marked && marked.length >= baseMarkLimit + lockerBonus) return false;
      item.marked = !item.marked;
      return item.marked;
    },
    selected(inventory) { return inventory.values().filter(item => item.marked && !item.secured); },
    secure(inventory, instanceIds) { for (const id of instanceIds) { const item = inventory.get(id); if (item) { item.secured = true; item.prototypeStatus = "extracted"; } } },
    markLimit(loadoutSources = []) { return baseMarkLimit + (loadoutSources.some(source => source.id === "prototype-locker") ? 1 : 0); }
  };
}
