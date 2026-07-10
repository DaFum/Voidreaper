const RARITY_RULES = Object.freeze({ common: [0, 1], uncommon: [1, 1], rare: [2, 2], epic: [3, 3], legendary: [3, 3], unique: [0, 0] });

export function createAffixRoller(pools) {
  const all = pools.flat();
  return {
    roll({ definition, rarity, itemPower, sector = 0, corruption = 0, rng }) {
      if (definition.fixedAffixes) return structuredClone(definition.fixedAffixes);
      const [minimum, maximum] = RARITY_RULES[rarity] ?? [0, 0];
      const count = rng.integer(minimum, maximum);
      const family = definition.family ?? definition.slot;
      const tags = new Set((definition.tags ?? []).map(tag => tag.id));
      const candidates = all.filter(affix => (!affix.families?.length || affix.families.includes(family) || affix.families.includes(definition.slot)) && corruption >= (affix.minimumCorruption ?? 0));
      const selected = [];
      while (selected.length < count && candidates.length) {
        const affix = rng.weighted(candidates.map(candidate => ({ value: candidate, weight: candidate.weight * (candidate.tags?.some(tag => tags.has(tag)) ? 1.8 : 1) * (1 + sector * 0.03) })));
        candidates.splice(candidates.indexOf(affix), 1);
        const value = affix.modifier ? rng.range(...affix.modifier.range) * (0.85 + itemPower / 500) : null;
        selected.push({ id: affix.id, value: affix.modifier?.integer ? Math.round(value) : value, corruption: affix.minimumCorruption ?? 0 });
      }
      return selected;
    }
  };
}

export { RARITY_RULES };
