import { legacyRuntime } from "../legacy/legacy-runtime.js";
import { createEventBus } from "../core/event-bus.js";
import { createStatEngine } from "../features/stats/stat-engine.js";
import { STAT_DEFINITIONS } from "../content/stats/stat-definitions.js";
import { createTagEngine } from "../features/tags/tag-engine.js";
import { TAG_DEFINITIONS } from "../content/tags/tag-definitions.js";
import { SYNERGY_DEFINITIONS } from "../content/tags/synergy-definitions.js";
import { createEffectRegistry } from "../features/effects/effect-registry.js";
import { registerCoreEffects } from "../content/effects/core-effects.js";
import { createTriggerEngine } from "../features/triggers/trigger-engine.js";
import { createEnergySystem } from "../features/energy/energy-system.js";
import { createHeatSystem } from "../features/heat/heat-system.js";
import { createCorruptionSystem } from "../features/corruption/corruption-system.js";
import { createDodgeSystem } from "../features/combat/dodge-system.js";
import { createEvolutionSystem } from "../features/evolution/evolution-system.js";
import { LEGACY_EVOLUTIONS } from "../content/evolutions/legacy-evolutions.js";
import { createSaveStore } from "../persistence/save-store.js";
import { createInputController } from "../input/input-controller.js";
import { createBuildInspector } from "../ui/screens/build-inspector.js";
import { updateResourceMeters } from "../ui/components/resource-meters.js";
import { createGameController } from "./game-controller.js";

export async function bootstrap() {
  document.documentElement.dataset.app = "voidreaper-modular";
  const events = createEventBus();
  const effects = registerCoreEffects(createEffectRegistry());
  effects.register("evolution-prism-lance", (_effect, { player }) => { player.evoPrism = true; player.pierce += 99; player.bulletSpeed *= 1.5; });
  effects.register("evolution-singularity", (_effect, { player }) => { player.evoSing = true; player.novaCd = Math.max(2, player.novaCd * 0.8); });
  effects.register("evolution-blood-halo", (_effect, { player }) => { player.evoHalo = true; player.orbitals += 2; });
  effects.register("evolution-reaper-protocol", (_effect, { player }) => { player.evoReaper = true; player.crit += 0.15; });
  effects.register("evolution-ion-tempest", (_effect, { player }) => { player.evoTempest = true; });
  const services = {
    events,
    effects,
    stats: createStatEngine(STAT_DEFINITIONS, context => context.sources ?? []),
    tags: createTagEngine(TAG_DEFINITIONS, SYNERGY_DEFINITIONS),
    energy: createEnergySystem({ eventBus: events }),
    heat: createHeatSystem({ eventBus: events }),
    corruption: createCorruptionSystem({ eventBus: events }),
    dodge: createDodgeSystem({ eventBus: events })
  };
  services.evolutions = createEvolutionSystem(LEGACY_EVOLUTIONS, { eventBus: events });
  services.triggers = createTriggerEngine({ eventBus: events, effects });
  services.save = createSaveStore(globalThis.storage ?? globalThis.localStorage, {
    onWarning: message => legacyRuntime.ui.toast(message)
  });

  const controller = createGameController(services);
  const input = createInputController({ eventBus: events });
  input.start();
  const inspector = createBuildInspector(document.querySelector("#build-inspector"), services);
  const game = legacyRuntime.game;
  const ui = legacyRuntime.ui;
  legacyRuntime.configureEvolutionEffects((effectId, player) => effects.execute({ id: effectId }, { player, run: controller.run }));

  const originalReset = game.reset.bind(game);
  game.reset = mode => {
    originalReset(mode);
    controller.attachLegacy(game);
  };
  const originalDraw = game.draw.bind(game);
  game.draw = () => {
    if (game.state === "run") controller.syncLegacy(game, game.STEP);
    originalDraw();
  };
  const originalHud = ui.hud.bind(ui);
  ui.hud = (player, legacyGame) => {
    originalHud(player, legacyGame);
    const run = controller.run;
    if (!run) return;
    updateResourceMeters(document.querySelector("#resource-meters"), {
      energy: { value: run.player.resources.energy, maximum: run.player.resources.maxEnergy },
      heat: run.heat.value,
      corruption: run.corruption.value,
      load: run.player.energy
    });
  };
  const originalPauseStats = ui.pauseStats.bind(ui);
  ui.pauseStats = legacyGame => {
    originalPauseStats(legacyGame);
    inspector.update(controller.inspectorModel(legacyGame));
  };

  events.on("action", ({ action }) => {
    if (action === "dodge" && game.state === "run") controller.useDodge(game, input.axis());
  });
  for (const button of document.querySelectorAll("[data-action]")) {
    button.addEventListener("click", () => input.trigger(button.dataset.action));
  }

  const legacySave = legacyRuntime.persistence;
  legacySave.load = async () => {
    const save = await services.save.load();
    legacySave.data = {
      best: save.legacy.best,
      dailyBest: save.legacy.dailyBest,
      shards: save.currencies.voidShards,
      meta: save.legacy.meta,
      ach: save.legacy.achievements,
      totalKills: save.profile.totalKills,
      totalRuns: save.profile.totalRuns
    };
  };
  legacySave.save = () => services.save.update(save => {
    save.legacy.best = legacySave.data.best;
    save.legacy.dailyBest = legacySave.data.dailyBest;
    save.legacy.meta = legacySave.data.meta;
    save.legacy.achievements = legacySave.data.ach;
    save.currencies.voidShards = legacySave.data.shards;
    save.profile.totalKills = legacySave.data.totalKills;
    save.profile.totalRuns = legacySave.data.totalRuns;
  });

  legacyRuntime.start();
}
