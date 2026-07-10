export const ITEM_OWNERSHIP = Object.freeze({ TEMPORARY: "temporary", BLUEPRINT: "blueprint", RELIC: "relic", PROTOTYPE: "prototype" });

export function createInventoryService(items = {}) {
  const entries = new Map(Object.entries(items));
  return {
    add(item) { if (entries.has(item.instanceId)) throw new Error(`Duplicate item instance: ${item.instanceId}`); entries.set(item.instanceId, structuredClone(item)); return item; },
    get(id) { return entries.get(id) ?? null; },
    remove(id) { const item = entries.get(id); entries.delete(id); return item ?? null; },
    values() { return [...entries.values()]; },
    serialize() { return Object.fromEntries(entries); }
  };
}
