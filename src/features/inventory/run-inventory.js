export function createRunInventory() {
  const items = new Map();
  const pending = new Map();
  return {
    add(item, ownership = "temporary") { const entry = { ...item, ownership, secured: false, marked: false }; items.set(entry.instanceId, entry); return entry; },
    remove(id) { const value = items.get(id); items.delete(id); return value ?? null; },
    get(id) { return items.get(id) ?? null; },
    values() { return [...items.values()]; },
    store(id) { const item=items.get(id); if(item)item.stored=true; return item??null; },
    addPending(entry) { pending.set(entry.pendingMountId, structuredClone(entry)); return entry; },
    updatePending(id, patch) { const entry=pending.get(id); if(!entry)return null; Object.assign(entry,patch); return entry; },
    restorePending(entries=[]) { pending.clear(); for(const entry of entries)pending.set(entry.pendingMountId,structuredClone(entry)); },
    pending() { return [...pending.values()]; },
    serialize() { return [...items.values()].map(item => structuredClone(item)); },
    serializePending() { return [...pending.values()].map(item => structuredClone(item)); }
  };
}
