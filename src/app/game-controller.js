import { createRunState } from "../runtime/create-run-state.js";
import { createHeatState } from "../features/heat/heat-system.js";
import { createCorruptionState } from "../features/corruption/corruption-system.js";

const UPGRADE_TAGS = {
  multi: ["Projectile"], damage: ["Kinetic"], dmg: ["Kinetic"], rate: ["Cooldown"], speed: ["Movement"],
  pierce: ["Pierce"], crit: ["Critical"], orbit: ["Orbit"], nova: ["Nova"], regen: ["Healing"],
  bspeed: ["Projectile"], magnet: ["Pickup"]
};

export function createGameController(services) {
  let run = null;

  function legacySources(game) {
    const sources = [{ id: "legacy-railgun", tags: [{ id: "Weapon", value: 1 }, { id: "Projectile", value: 1 }, { id: "Kinetic", value: 1 }], modifiers: [] }];
    for (const [id, level] of Object.entries(game.upgradeCounts ?? {})) {
      if (!level || id.startsWith("evo_")) continue;
      sources.push({ id: `upgrade-${id}`, tags: (UPGRADE_TAGS[id] ?? []).map(tagId => ({ id: tagId, value: level })), modifiers: [] });
    }
    return sources;
  }

  return {
    get run() { return run; },
    attachLegacy(game) {
      run = createRunState({ seed: game.seed, mode: game.mode === "daily" ? "daily" : "campaign" });
      if (run.mode === "daily" && services.daily) services.daily.apply(run, services.daily.config());
      run.services = services;
      run.heat = createHeatState();
      run.corruption = createCorruptionState(game.corruption ?? 0);
      services.sectors?.start(run);
      services.energy.initialize(run.player, { capacity: 100, reserved: 92, regeneration: 12 });
      this.syncLegacy(game, 0);
      services.events.emit("run-started", { run });
      return run;
    },
    syncLegacy(game, dt) {
      if (!run || !game.player) return;
      const player = game.player;
      Object.assign(run.player, { x: player.x, y: player.y, hull: player.hp, maxHull: player.maxHp });
      run.time = game.time;
      run.score = game.score;
      run.kills = game.kills;
      run.wave = game.wave;
      run.build.sources = legacySources(game);
      run.build.tags = services.tags.collect(run.build.sources);
      services.energy.update(run.player, dt);
      services.dodge.update(run.player, dt);
      services.heat.update(run.heat, dt, { coolingRate: 10 });
      if ((game.corruption ?? 0) !== run.corruption.value) {
        services.corruption.change(run.corruption, (game.corruption ?? 0) - run.corruption.value, "legacy-run", run.time);
      }
      run.player.resources.heat = run.heat.value;
      run.player.resources.corruption = run.corruption.value;
    },
    useDodge(game, axis) {
      if (!run || !game.player) return false;
      const direction = axis.x || axis.y ? axis : { x: 1, y: 0 };
      if (!services.dodge.use(run.player, direction)) return false;
      game.player.x += direction.x * 120;
      game.player.y += direction.y * 120;
      return true;
    },
    inspectorModel(game) {
      const tags = run?.build.tags ?? new Map();
      const context = {
        tags,
        upgrades: game.upgradeCounts,
        corruption: run?.corruption.value ?? 0,
        loadRatio: run?.player.energy?.ratio ?? 0,
        activeByWeapon: new Map(),
        sources: run?.build.sources ?? []
      };
      return {
        tags,
        statContext: { run, player: run?.player, sources: context.sources },
        synergies: services.tags.resolve(tags, context),
        evolutions: services.evolutions.evaluate(context),
        load: run?.player.energy ?? { ratio: 0, tier: "stable" },
        heat: run?.heat.value ?? 0,
        corruption: run?.corruption.value ?? 0,
        faultPressure: run?.faults?.pressure ?? 0
      };
    }
  };
}
