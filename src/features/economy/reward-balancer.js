export function balanceMetaRewards(summary, save) {
  const base = 8 + Math.min(12, summary.sectors * 2);
  const extractionBonus = summary.extracted * 8;
  const consolation = summary.victory ? 0 : Math.max(3, Math.floor(base * .35));
  const rewards = { voidShards: base + extractionBonus + consolation, salvageFragments: summary.extracted * 3 + (summary.lost ?? 0), bossCores: summary.bosses?.length ?? 0, anomalyData: summary.anomaliesAccepted ?? 0 };
  return rewards;
}

export function duplicateFragments(item) { return { salvageFragments: { common: 2, rare: 5, epic: 12, legendary: 25, unique: 40 }[item.rarity] ?? 2 }; }
