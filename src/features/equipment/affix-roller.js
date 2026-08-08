const RARITY_RULES = Object.freeze({
  common: [0, 1],
  uncommon: [1, 1],
  rare: [2, 2],
  epic: [3, 3],
  legendary: [3, 3],
  unique: [0, 0],
});

export function createAffixRoller(pools) {
  const all = pools.flat();
  return {
    roll({ definition, rarity, itemPower, sector = 0, corruption = 0, rng }) {
      if (definition.fixedAffixes)
        return structuredClone(definition.fixedAffixes);
      const [minimum, maximum] = RARITY_RULES[rarity] ?? [0, 0];
      const count = rng.integer(minimum, maximum);
      const family = definition.family ?? definition.slot;
      const tags = new Set((definition.tags ?? []).map((tag) => tag.id));
      // ⚡ Bolt: Calculate weights once and avoid intermediate arrays from map() and array shifts from splice()
      const weightedCandidates = [];
      for (let i = 0; i < all.length; i++) {
        const affix = all[i];
        if (
          (!affix.families?.length ||
            affix.families.includes(family) ||
            affix.families.includes(definition.slot)) &&
          corruption >= (affix.minimumCorruption ?? 0)
        ) {
          weightedCandidates.push({
            value: affix,
            weight:
              affix.weight *
              (affix.tags?.some((tag) => tags.has(tag)) ? 1.8 : 1) *
              (1 + sector * 0.03),
          });
        }
      }

      const selected = [];
      while (selected.length < count && weightedCandidates.length) {
        const affix = rng.weighted(weightedCandidates);

        let idx = -1;
        for (let i = 0; i < weightedCandidates.length; i++) {
          if (weightedCandidates[i].value === affix) {
            idx = i;
            break;
          }
        }

        if (idx !== -1) {
          // Splice is used instead of swap-and-pop to maintain candidate order,
          // which is required for deterministic RNG seed sequences in multi-roll tests.
          weightedCandidates.splice(idx, 1);
        }
        const value = affix.modifier
          ? rng.range(...affix.modifier.range) * (0.85 + itemPower / 500)
          : null;
        selected.push({
          id: affix.id,
          value: affix.modifier?.integer ? Math.round(value) : value,
          corruption: affix.minimumCorruption ?? 0,
        });
      }
      return selected;
    },
  };
}
