function deepFreeze(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Object.isFrozen(obj)) return obj;
  Object.freeze(obj);
  if (Array.isArray(obj)) {
    for (const item of obj) deepFreeze(item);
  } else {
    for (const key of Object.keys(obj)) {
      deepFreeze(obj[key]);
    }
  }
  return obj;
}

function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(deepClone);
  const clone = { ...obj };
  for (const key of Object.keys(clone)) {
    clone[key] = deepClone(clone[key]);
  }
  return clone;
}

export function createRegistry(kind) {
  const entries = new Map();

  return {
    kind,
    register(definition) {
      if (!definition?.id) throw new Error(`${kind} definition requires id`);
      if (entries.has(definition.id)) throw new Error(`Duplicate ${kind} id: ${definition.id}`);
      const frozen = deepFreeze(deepClone(definition));
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
