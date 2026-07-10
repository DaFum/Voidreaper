export function createRunInventory() {
  const items = new Map();
  return {
    add(item, ownership = "temporary") { const entry = { ...item, ownership, secured: false, marked: false }; items.set(entry.instanceId, entry); return entry; },
    remove(id) { const value = items.get(id); items.delete(id); return value ?? null; },
    get(id) { return items.get(id) ?? null; },
    values() { return [...items.values()]; },
    serialize() { return [...items.values()].map(item => structuredClone(item)); }
  };
}
