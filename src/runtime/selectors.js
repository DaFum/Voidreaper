export function selectStat(run, statId, fallback = 0) {
  const calculated = run.services?.stats?.calculate(statId, { run, player: run.player });
  if (calculated) return calculated.value;
  return run.player.stats.get(statId) ?? fallback;
}

export const selectHullRatio = run => run.player.maxHull > 0 ? run.player.hull / run.player.maxHull : 0;
export const selectEnergyRatio = run => run.player.resources.maxEnergy > 0
  ? run.player.resources.energy / run.player.resources.maxEnergy
  : 0;
export const selectLoadoutSources = run => run.player.loadout?.sources ?? [];
export const selectActiveTags = run => [...run.build.tags.entries()].filter(([, value]) => value > 0);

export function selectRiskSummary(run) {
  return {
    load: run.energy?.load ?? { ratio: 0, tier: "stable" },
    heat: run.player.resources.heat,
    corruption: run.player.resources.corruption,
    nextFaultTier: run.faults?.nextTier ?? "none"
  };
}
