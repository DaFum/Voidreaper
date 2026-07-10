import { hashString } from "../../core/rng.js";

export function createDailyRunService({ seedVersion = 1, contentVersion = "3.0.0", saveStore } = {}) {
  const dateKey = date => date.toISOString().slice(0, 10);
  return {
    config(value = new Date()) { const date = dateKey(value); return { date, seed: hashString(`${date}:${seedVersion}:${contentVersion}`), seedVersion, contentVersion, normalized: true }; },
    apply(run, config) { run.seed = config.seed; run.mode = "daily"; run.daily = config; run.permanentBonusesDisabled = true; run.prototypeBonusesDisabled = true; return run; },
    async record(config, score) { await saveStore?.update(save => { save.legacy.dailyBest[config.date] = { score: Math.max(score, save.legacy.dailyBest[config.date]?.score ?? 0), seedVersion, contentVersion }; }); }
  };
}
