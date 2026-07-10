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
import { createEquipmentRegistry } from "../features/equipment/equipment-registry.js";
import { createUnlockService } from "../features/research/unlock-service.js";
import { SHIPS } from "../content/ships/index.js";
import { WEAPONS } from "../content/weapons/index.js";
import { REACTORS } from "../content/reactors/reactors.js";
import { MODULES } from "../content/modules/index.js";
import { createHangarScreen } from "../ui/screens/hangar-screen.js";
import { createSectorController } from "../features/sectors/sector-controller.js";
import { createRunCurrencyService } from "../features/economy/run-currency-service.js";
import { createDailyRunService } from "../features/sectors/daily-run-service.js";
import { createSectorMapScreen } from "../ui/screens/sector-map-screen.js";
import { createRunState } from "../runtime/create-run-state.js";
import { createHeatState } from "../features/heat/heat-system.js";
import { createCorruptionState } from "../features/corruption/corruption-system.js";
import { renderMerchantScreen } from "../ui/screens/merchant-screen.js";
import { createMerchantService } from "../features/merchant/merchant-service.js";
import { createAnomalyService } from "../features/sectors/anomaly-service.js";
import { renderAnomalyScreen } from "../ui/screens/anomaly-screen.js";
import { renderWorkshopScreen } from "../ui/screens/workshop-screen.js";
import { createWorkshopService } from "../features/workshop/workshop-service.js";
import { createCheckpointService } from "../features/checkpoints/checkpoint-service.js";

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
  services.sectors = createSectorController({ eventBus: events });
  services.currency = createRunCurrencyService(events);
  services.daily = createDailyRunService({ saveStore: services.save });
  services.checkpoints = createCheckpointService(services.save, events);
  const initialSave = await services.save.load();
  services.unlocks = createUnlockService(initialSave.unlocks);
  services.equipment = createEquipmentRegistry();
  for (const definition of [...SHIPS, ...WEAPONS, ...REACTORS, ...MODULES]) services.equipment.register(definition);
  console.info(`[content] ${SHIPS.length} ships · ${WEAPONS.length} weapons · ${REACTORS.length} reactors · ${MODULES.length} modules`);

  const controller = createGameController(services);
  const input = createInputController({ eventBus: events });
  input.start();
  const inspector = createBuildInspector(document.querySelector("#build-inspector"), services);
  const game = legacyRuntime.game;
  const ui = legacyRuntime.ui;
  legacyRuntime.configureEvolutionEffects((effectId, player) => effects.execute({ id: effectId }, { player, run: controller.run }));
  const hangarRoot = document.querySelector("#hangar");
  let previewRun;
  let mapScreen;
  let activeCampaignNodeId = null;
  let originalStartWave;
  const showCampaignMap = () => {
    if (!previewRun) {
      previewRun = createRunState({ seed: Date.now(), mode: "campaign" });
      previewRun.heat = createHeatState();
      previewRun.corruption = createCorruptionState();
      previewRun.resources.scrap = 80;
      previewRun.resources.flux = 6;
      services.sectors.start(previewRun);
    }
    const stage = hangarRoot.querySelector(".hangar-content");
    mapScreen = createSectorMapScreen(stage, { onConfirm: node => {
      if (!services.sectors.enter(previewRun, node.id)) return;
      const finish = () => { services.sectors.complete(previewRun, node.id); services.checkpoints.writeAfterNode(previewRun, node.id); showCampaignMap(); };
      if (["combat", "elite", "salvage", "mid-boss", "boss", "extraction"].includes(node.type)) {
        activeCampaignNodeId = node.id;
        if (game.player && game.wave > 0) { game.state = "run"; ui.show("hud"); originalStartWave(game.wave + 1); }
        else game.start("standard");
        return;
      }
      if (node.type === "merchant") {
        const merchant = createMerchantService({ modules: MODULES, weapons: WEAPONS, reactors: REACTORS, currencyService: services.currency, eventBus: events });
        renderMerchantScreen(stage, { offers: merchant.roll(node.seed, node.regionIndex), resources: previewRun.resources, onBuy: offer => { merchant.buy(previewRun, offer); finish(); }, onReroll: () => renderMerchantScreen(stage, { offers: merchant.reroll(node.seed, node.regionIndex), resources: previewRun.resources, onBuy: offer => { merchant.buy(previewRun, offer); finish(); }, onReroll: finish }) });
        return;
      }
      if (node.type === "workshop") {
        const workshop = createWorkshopService({ eventBus: events }); const session = workshop.open(node.regionIndex); const target = previewRun.inventory[0] ?? { id: "standard-core", name: "Standard Core", itemPower: 100 };
        renderWorkshopScreen(stage, { service: workshop, session, target, onAction: (action, item) => { workshop.apply(session, action, item); finish(); } }); return;
      }
      if (node.type === "anomaly") {
        const anomaly = createAnomalyService(events); const signal = anomaly.select(node.seed, previewRun.anomalies?.map(entry => entry.eventId));
        renderAnomalyScreen(stage, { event: signal, onChoose: choiceId => { anomaly.resolve(previewRun, signal, choiceId); finish(); } }); return;
      }
      finish();
    } });
    mapScreen.render(services.sectors.model(previewRun));
  };
  const hangar = createHangarScreen(hangarRoot, {
    ships: SHIPS,
    weapons: WEAPONS,
    reactors: REACTORS,
    modules: MODULES,
    checkpoint: initialSave.checkpoint,
    isUnlocked: definition => services.unlocks.isUnlocked(definition),
    onStart: showCampaignMap,
    onResume: checkpoint => { previewRun = checkpoint.run; showCampaignMap(); }
  });
  ui.renderHangar = () => hangar.render();

  const originalReset = game.reset.bind(game);
  game.reset = mode => {
    originalReset(mode);
    controller.attachLegacy(game);
  };
  originalStartWave = game.startWave.bind(game);
  game.startWave = wave => {
    if (activeCampaignNodeId && wave > 1) {
      services.sectors.complete(previewRun, activeCampaignNodeId);
      services.checkpoints.writeAfterNode(previewRun, activeCampaignNodeId);
      activeCampaignNodeId = null;
      game.state = "sector-map";
      ui.show("start");
      hangar.render();
      showCampaignMap();
      return;
    }
    originalStartWave(wave);
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
      , scrap: run.resources.scrap, flux: run.resources.flux
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
