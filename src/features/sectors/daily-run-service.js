import { createRunRng, hashString } from "../../core/rng.js";

export function createDailyRunService({ seedVersion = 1, contentVersion = "3.0.0", saveStore } = {}) {
  const dateKey = date => date.toISOString().slice(0, 10);
  return {
    config(value = new Date()) { const date = dateKey(value); return { date, seed: hashString(`${date}:${seedVersion}:${contentVersion}`), seedVersion, contentVersion, normalized: true }; },
    // Reseed the run RNG from the normalized daily seed so run.seed matches the
    // randomness actually used — recorded seeds must reproduce the run.
    apply(run, config) { run.seed = config.seed >>> 0; run.rng = createRunRng(config.seed); run.mode = "daily"; run.daily = config; run.permanentBonusesDisabled = true; run.prototypeBonusesDisabled = true; return run; },
    async record(config, score) { await saveStore?.update(save => { save.legacy.dailyBest[config.date] = Math.max(score, save.legacy.dailyBest[config.date] ?? 0); }); }
  };
}
