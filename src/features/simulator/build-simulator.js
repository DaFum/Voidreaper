import { createRunState } from "../../runtime/create-run-state.js";
import { SIMULATOR_ENEMIES } from "./simulator-enemies.js";

const STARTER_DPS = 18 / .42;

function loadoutDps(loadout) {
  const sources = Array.isArray(loadout?.sources) ? loadout.sources : [];
  const total = sources.reduce((sum, source) => {
    const damage = Number(source.damage ?? source.itemPower ?? 0);
    const rate = Number(source.fireRate ?? (source.cooldown ? 1 / source.cooldown : 0));
    return sum + damage * rate;
  }, 0);
  return total > 0 ? total : STARTER_DPS;
}

export function createBuildSimulator() {
  return {
    create({ seed = 1, enemyId = "swarm", density = 1, duration = 60, loadout } = {}) { const run = createRunState({ seed, mode: "simulator" }); run.loadout = structuredClone(loadout ?? {}); run.simulator = { enemyId, density, duration, elapsed: 0, rewardsDisabled: true, immutableCurrencies: true, telemetry: { damage: 0, heat: [], energy: [], triggers: 0, faults: [] } }; return run; },
    record(run, sample) { const telemetry = run.simulator.telemetry; telemetry.damage += sample.damage ?? 0; telemetry.heat.push(sample.heat ?? 0); telemetry.energy.push(sample.energy ?? 0); telemetry.triggers += sample.triggers ?? 0; if (sample.fault) telemetry.faults.push(sample.fault); run.simulator.elapsed += sample.dt ?? 0; },
    simulate(run) {
      const simulator = run.simulator;
      const enemy = SIMULATOR_ENEMIES.find(candidate => candidate.id === simulator.enemyId) ?? SIMULATOR_ENEMIES[0];
      const duration = Math.min(300, Math.max(1, Math.round(simulator.duration)));
      const density = Math.min(5, Math.max(.5, Number(simulator.density) || 1));
      const baseDps = loadoutDps(run.loadout);
      const armorFactor = Math.max(.55, 1 - Math.log10(Math.max(1, enemy.health / 60)) * .12);
      const crowdFactor = 1 + Math.max(0, density - 1) * .18;
      for (let second = 0; second < duration; second += 1) {
        const variance = .9 + run.rng.next() * .2;
        const heat = Math.min(100, 4 * density + second * .32);
        const energy = Math.max(0, 100 - density * 5 - heat * .18);
        this.record(run, {
          dt: 1,
          damage: baseDps * armorFactor * crowdFactor * variance,
          heat,
          energy,
          triggers: Math.max(1, Math.round(density * .8)),
          fault: heat >= 95 && run.rng.next() < .04 ? "thermal-fault" : null
        });
      }
      return this.summary(run);
    },
    summary(run) { const t = run.simulator.telemetry; return { dps: t.damage / Math.max(1, run.simulator.elapsed), heat: t.heat, energy: t.energy, triggers: t.triggers, faults: t.faults, seed: run.seed }; },
    finish(run) { return { ...this.summary(run), rewards: {}, currencyChanges: {}, prototypeChanges: {} }; }
  };
}
