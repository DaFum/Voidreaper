import { createRunState } from "../../runtime/create-run-state.js";

export function createBuildSimulator() {
  return {
    create({ seed = 1, enemyId = "swarm", density = 1, duration = 60, loadout } = {}) { const run = createRunState({ seed, mode: "simulator" }); run.loadout = structuredClone(loadout ?? {}); run.simulator = { enemyId, density, duration, elapsed: 0, rewardsDisabled: true, immutableCurrencies: true, telemetry: { damage: 0, heat: [], energy: [], triggers: 0, faults: [] } }; return run; },
    record(run, sample) { const telemetry = run.simulator.telemetry; telemetry.damage += sample.damage ?? 0; telemetry.heat.push(sample.heat ?? 0); telemetry.energy.push(sample.energy ?? 0); telemetry.triggers += sample.triggers ?? 0; if (sample.fault) telemetry.faults.push(sample.fault); run.simulator.elapsed += sample.dt ?? 0; },
    summary(run) { const t = run.simulator.telemetry; return { dps: t.damage / Math.max(1, run.simulator.elapsed), heat: t.heat, energy: t.energy, triggers: t.triggers, faults: t.faults, seed: run.seed }; },
    finish(run) { return { ...this.summary(run), rewards: {}, currencyChanges: {}, prototypeChanges: {} }; }
  };
}
