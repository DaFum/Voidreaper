export function visualHash(value) {
  let hash = 2166136261;
  for (const character of String(value ?? 0)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededUnit(seed, channel = 0) {
  let value = visualHash(`${seed}:${channel}`) || 1;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return (value >>> 0) / 0xffffffff;
}

export function seededChoice(items, seed, channel = 0) {
  if (!items?.length) return undefined;
  return items[Math.min(items.length - 1, Math.floor(seededUnit(seed, channel) * items.length))];
}

export function seededSigned(seed, channel = 0) {
  return seededUnit(seed, channel) * 2 - 1;
}
