export function createRegistry(kind) {
  const entries = new Map();

  return {
    kind,
    register(definition) {
      if (!definition?.id) throw new Error(`${kind} definition requires id`);
      if (entries.has(definition.id)) throw new Error(`Duplicate ${kind} id: ${definition.id}`);
      const frozen = Object.freeze({ ...definition });
      entries.set(definition.id, frozen);
      return frozen;
    },
    registerMany(definitions) {
      return definitions.map(definition => this.register(definition));
    },
    get(id) {
      return entries.get(id) ?? null;
    },
    require(id) {
      const value = entries.get(id);
      if (!value) throw new Error(`Unknown ${kind} id: ${id}`);
      return value;
    },
    has(id) {
      return entries.has(id);
    },
    values() {
      return [...entries.values()];
    },
    get size() {
      return entries.size;
    }
  };
}
