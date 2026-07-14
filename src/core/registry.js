function deepFreeze(obj, visited = new WeakSet()) {
  if (obj === null || typeof obj !== "object") return obj;
  // Object.isFrozen is shallow, so a pre-frozen object may still hold mutable
  // children — track visited nodes instead of early-returning on frozen ones.
  if (visited.has(obj)) return obj;
  visited.add(obj);
  Object.freeze(obj);
  if (Array.isArray(obj)) {
    for (const item of obj) deepFreeze(item, visited);
  } else if (obj instanceof Map) {
    for (const [key, value] of obj) {
      deepFreeze(key, visited);
      deepFreeze(value, visited);
    }
  } else if (obj instanceof Set) {
    for (const value of obj) deepFreeze(value, visited);
  } else {
    for (const key of Object.keys(obj)) {
      deepFreeze(obj[key], visited);
    }
  }
  return obj;
}

const readonlyBuiltin = (target, mutators) => {
  let proxy;
  proxy = new Proxy(target, {
    get(value, property) {
      if (mutators.has(property)) return () => { throw new TypeError("Registered content is read-only"); };
      if (property === "forEach" && typeof value.forEach === "function") {
        return (callback, thisArg) => value.forEach((item, key) => callback.call(thisArg, item, key, proxy));
      }
      const member = Reflect.get(value, property, value);
      return typeof member === "function" ? member.bind(value) : member;
    }
  });
  return proxy;
};

const MAP_MUTATORS = new Set(["clear", "delete", "set"]);
const SET_MUTATORS = new Set(["add", "clear", "delete"]);
const DATE_MUTATORS = new Set(Object.getOwnPropertyNames(Date.prototype).filter(name => name.startsWith("set")));

function deepClone(obj, visited = new WeakMap()) {
  if (obj === null || typeof obj !== "object") return obj;
  if (visited.has(obj)) return visited.get(obj);
  if (obj instanceof Date) {
    const clone = readonlyBuiltin(new Date(obj.getTime()), DATE_MUTATORS);
    visited.set(obj, clone);
    return clone;
  }
  const target = Array.isArray(obj) ? [] : obj instanceof Map ? new Map() : obj instanceof Set ? new Set() : {};
  const clone = obj instanceof Map ? readonlyBuiltin(target, MAP_MUTATORS)
    : obj instanceof Set ? readonlyBuiltin(target, SET_MUTATORS)
      : target;
  visited.set(obj, clone);
  if (Array.isArray(obj)) {
    for (const item of obj) clone.push(deepClone(item, visited));
  } else if (obj instanceof Map) {
    for (const [key, value] of obj) target.set(deepClone(key, visited), deepClone(value, visited));
  } else if (obj instanceof Set) {
    for (const value of obj) target.add(deepClone(value, visited));
  } else {
    for (const key of Object.keys(obj)) clone[key] = deepClone(obj[key], visited);
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
