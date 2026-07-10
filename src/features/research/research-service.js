export function createResearchService(saveStore, nodes) {
  const byId = new Map(nodes.map(node => [node.id, node]));
  const canPurchase = (save, node) => !save.research[node.id] && node.prerequisites.every(id => save.research[id]) && Object.entries(node.cost).every(([currency, amount]) => (save.currencies[currency] ?? 0) >= amount);
  return {
    canPurchase,
    async purchase(id) { const node = byId.get(id); if (!node) throw new Error(`Unknown research: ${id}`); return saveStore.update(save => { if (!canPurchase(save, node)) throw new Error(`Research unavailable: ${id}`); for (const [currency, amount] of Object.entries(node.cost)) save.currencies[currency] -= amount; save.research[id] = { purchasedAt: new Date().toISOString() }; for (const unlock of node.unlocks) save.unlocks[unlock] = true; return save; }); },
    refundCredit(save, amount) { save.currencies.voidShards += Math.max(0, amount); return save; }
  };
}
