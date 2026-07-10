export function mulberry32(seed) {
  let state = seed | 0;
  const next = () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  next.getState = () => state >>> 0;
  next.setState = value => { state = value | 0; };
  return next;
}

export function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createRunRng(seed, restoredState) {
  const next = mulberry32(restoredState ?? seed);
  return {
    seed: seed >>> 0,
    next,
    range: (min, max) => min + next() * (max - min),
    integer: (min, maxInclusive) => Math.floor(min + next() * (maxInclusive - min + 1)),
    pick: values => values[Math.floor(next() * values.length)],
    weighted(entries) {
      const total = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
      if (total <= 0) return entries[0]?.value ?? null;
      let roll = next() * total;
      for (const entry of entries) {
        roll -= Math.max(0, entry.weight);
        if (roll <= 0) return entry.value;
      }
      return entries.at(-1)?.value ?? null;
    },
    snapshot: () => next.getState()
  };
}
