export function createPrototypeVault(save, { capacity = 20 } = {}) {
  const vault = save.inventory;
  const overflow = save.overflow;
  const values = () => Object.values(vault);
  return {
    get capacity() { return Math.min(100, capacity + (save.unlocks["vault-30"] ? 10 : 0) + (save.unlocks["vault-50"] ? 20 : 0)); },
    add(item) { const duplicate = values().find(entry => entry.definitionId && entry.definitionId === item.definitionId); if (duplicate) { const fragments = { common: 2, rare: 5, epic: 12, legendary: 25, unique: 40 }[item.rarity] ?? 2; save.currencies.salvageFragments += fragments; return "fragments"; } const target = values().length < this.capacity ? vault : overflow; target[item.instanceId] = structuredClone(item); return target === vault ? "vault" : "overflow"; },
    filter(filters = {}) { return values().filter(item => (!filters.family || item.family === filters.family) && (!filters.tag || item.tags?.some(tag => (tag.id ?? tag) === filters.tag)) && (!filters.rarity || item.rarity === filters.rarity) && (!filters.stability || item.stability === filters.stability) && (!filters.source || item.source === filters.source)); },
    favorite(id, value = true) { if (vault[id]) vault[id].favorite = value; },
    remove(id) { if (vault[id]?.favorite) return null; const item = vault[id]; delete vault[id]; return item ?? null; },
    repair(id, fragments = 1) { const item = vault[id]; if (!item || save.currencies.salvageFragments < fragments) return false; save.currencies.salvageFragments -= fragments; item.stability = 100; item.durability = 100; return true; },
    dismantle(id) { const item = this.remove(id); if (!item) return 0; const fragments = { common: 2, rare: 5, epic: 12, legendary: 25, unique: 40 }[item.rarity] ?? 2; save.currencies.salvageFragments += fragments; return fragments; },
    extractAffix(id, affixId) { const item = vault[id]; if (!item || item.favorite) return null; const affix = item.affixes?.find(entry => entry.id === affixId); if (!affix) return null; save.blueprints[`affix:${affixId}`] = { ...affix, sourceItemId: id }; delete vault[id]; return affix; },
    equip(id, loadout, slot) { if (!vault[id]) return false; loadout[slot] = id; return true; }
  };
}
