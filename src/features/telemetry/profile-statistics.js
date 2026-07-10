export function aggregateProfileStatistics(statistics, summary) {
  statistics.runs += 1; statistics.victories += summary.victory ? 1 : 0; statistics.kills += summary.kills ?? 0; statistics.deaths += summary.victory ? 0 : 1; statistics.extractedPrototypes += summary.extracted ?? 0; statistics.lostPrototypes += summary.lost ?? 0;
  for (const boss of summary.bosses ?? []) statistics.bosses[boss] = (statistics.bosses[boss] ?? 0) + 1;
  if (summary.weaponId) statistics.weapons[summary.weaponId] = (statistics.weapons[summary.weaponId] ?? 0) + (summary.sectors ?? 0);
  if (summary.shipId) statistics.ships[summary.shipId] = (statistics.ships[summary.shipId] ?? 0) + (summary.sectors ?? 0);
  statistics.damageDealt = (statistics.damageDealt ?? 0) + (summary.damageDealt ?? 0); statistics.damageTaken = (statistics.damageTaken ?? 0) + (summary.damageTaken ?? 0); statistics.playTime = (statistics.playTime ?? 0) + (summary.time ?? 0); statistics.maxCorruption = Math.max(statistics.maxCorruption ?? 0, summary.corruption ?? 0); statistics.maxLoad = Math.max(statistics.maxLoad ?? 0, summary.maximumLoad ?? 0); return statistics;
}
