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
import { RESEARCH_TREE } from "../content/research/research-tree.js";
import { createResearchService } from "../features/research/research-service.js";
import { renderResearchScreen } from "../ui/screens/research-screen.js";
import { createCodexService } from "../features/codex/codex-service.js";
import { renderCodexScreen } from "../ui/screens/codex-screen.js";
import { CHALLENGES, createMasteryChallenges } from "../content/challenges/challenges.js";
import { renderChallengesScreen } from "../ui/screens/challenges-screen.js";
import { createPrototypeVault } from "../features/inventory/prototype-vault.js";
import { renderPrototypeVault } from "../ui/screens/prototype-vault-screen.js";
import { CAMPAIGN_PATHS } from "../content/campaigns/campaign-paths.js";
import { createCampaignPathService } from "../features/campaigns/campaign-path-service.js";
import { renderCampaignSelect } from "../ui/screens/campaign-select-screen.js";
import { createBuildSimulator } from "../features/simulator/build-simulator.js";
import { renderSimulatorScreen } from "../ui/screens/simulator-screen.js";
import { renderStatistics } from "../ui/screens/statistics-screen.js";
import { renderSettingsScreen } from "../ui/screens/settings-screen.js";
import { createOnboardingService } from "../features/onboarding/onboarding-service.js";
import { createTutorialCallout } from "../ui/components/tutorial-callout.js";
import { createWreckSignalService } from "../features/salvage/wreck-signal-service.js";
import { createSalvageMissionService } from "../features/salvage/salvage-mission-service.js";
import { renderSalvageMission } from "../ui/screens/salvage-mission-screen.js";
import { createAffixRoller } from "../features/equipment/affix-roller.js";
import { OFFENSIVE_AFFIXES } from "../content/affixes/offensive-affixes.js";
import { DEFENSIVE_AFFIXES } from "../content/affixes/defensive-affixes.js";
import { UTILITY_AFFIXES } from "../content/affixes/utility-affixes.js";
import { CORRUPTED_AFFIXES } from "../content/affixes/corrupted-affixes.js";
import { createAssemblyProfileRegistry } from "../features/ship-assembly/content/assembly-profile-registry.js";
import { SHIP_FRAME_ASSEMBLY_PROFILES } from "../features/ship-assembly/content/ship-frame-assembly-profiles.js";
import { createAssemblyRenderer } from "../render/ship-assembly/assembly-renderer.js";
import { getCoreGeometryIds } from "../features/ship-assembly/geometry/core-geometry-builders.js";
import { MODULE_VISUAL_PROFILES } from "../features/ship-assembly/content/module-visual-profiles.js";

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
  let metaSave = initialSave;
  services.research = createResearchService(services.save, RESEARCH_TREE);
  services.codex = createCodexService({ ships: SHIPS, weapons: WEAPONS, reactors: REACTORS, modules: MODULES, forbidden: WEAPONS.filter(weapon => weapon.id === "anomaly-engine") });
  services.campaignPaths = createCampaignPathService(CAMPAIGN_PATHS);
  services.simulator = createBuildSimulator();
  services.onboarding = createOnboardingService(services.save);
  services.wreckSignals = createWreckSignalService();
  services.salvageMissions = createSalvageMissionService(services.save);
  services.affixes = createAffixRoller([OFFENSIVE_AFFIXES, DEFENSIVE_AFFIXES, UTILITY_AFFIXES, CORRUPTED_AFFIXES]);
  services.assemblyProfiles = createAssemblyProfileRegistry();
  for (const profile of SHIP_FRAME_ASSEMBLY_PROFILES) services.assemblyProfiles.registerShipFrame(profile);
  services.assemblyRenderer = createAssemblyRenderer();
  console.info(`[assembly] ${services.assemblyProfiles.getCounts().shipFrames} ship profiles`);
  services.unlocks = createUnlockService(initialSave.unlocks);
  services.equipment = createEquipmentRegistry();
  for (const definition of [...SHIPS, ...WEAPONS, ...REACTORS, ...MODULES]) services.equipment.register(definition);
  console.info(`[content] ${SHIPS.length} ships · ${WEAPONS.length} weapons · ${REACTORS.length} reactors · ${MODULES.length} modules`);

  const controller = createGameController(services);
  if (import.meta.env.DEV) globalThis.__VOIDREAPER_DEBUG__ = { ...(globalThis.__VOIDREAPER_DEBUG__ ?? {}), assembly: { getSnapshot: () => services.currentAssembly?.getSnapshot() ?? null, getGeometry: () => services.assemblyGeometry?.getSnapshot() ?? null, assemblyVisualGallery: () => ({ cores: getCoreGeometryIds(), modules: MODULE_VISUAL_PROFILES.map(profile => profile.rendererId), damageStates: ["intact","armor-broken","core-disrupted"] }) } };
  const input = createInputController({ eventBus: events, bindings: metaSave.settings.bindings });
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
      previewRun.services = services;
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
        const workshop = createWorkshopService({ affixRoller: services.affixes, eventBus: events }); const session = workshop.open(node.regionIndex); const target = previewRun.inventory[0] ?? { ...REACTORS[0], rarity: "rare", itemPower: 100, affixes: [] };
        renderWorkshopScreen(stage, { service: workshop, session, target, onAction: (action, item) => { workshop.apply(session, action, item, { rng: previewRun.rng, sector: node.regionIndex }); finish(); } }); return;
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
    currencies: initialSave.currencies,
    checkpoint: initialSave.checkpoint,
    isUnlocked: definition => services.unlocks.isUnlocked(definition),
    onStart: showCampaignMap,
    onResume: checkpoint => { const hydrated = services.checkpoints.hydrate(checkpoint, services); if (!hydrated) return; previewRun = hydrated.run; showCampaignMap(); },
    renderTab: (tab, content) => {
      if (tab === "Forschung") renderResearchScreen(content, RESEARCH_TREE, { purchased: metaSave.research, canPurchase: node => services.research.canPurchase(metaSave, node), onPurchase: async id => { await services.research.purchase(id); metaSave = await services.save.load(); hangar.render(); } });
      if (tab === "Codex") { const show = filters => renderCodexScreen(content, { entries: services.codex.filter(metaSave, filters), onFilter: show }); show({}); }
      if (tab === "Herausforderungen") renderChallengesScreen(content, [...CHALLENGES, ...createMasteryChallenges(SHIPS, WEAPONS)], metaSave.challenges);
      if (tab === "Prototypen") { const vault = createPrototypeVault(metaSave); renderPrototypeVault(content, { items: Object.values(metaSave.inventory), capacity: vault.capacity, overflowCount: Object.keys(metaSave.overflow).length, onFavorite: async id => { vault.favorite(id, !metaSave.inventory[id].favorite); await services.save.save(metaSave); hangar.render(); }, onDismantle: async id => { vault.dismantle(id); await services.save.save(metaSave); hangar.render(); } }); }
      if (tab === "Kampagnen") renderCampaignSelect(content, services.campaignPaths.available(metaSave), async id => { await services.save.update(save => { services.campaignPaths.select(save, id); }); metaSave = await services.save.load(); hangar.show("Run starten"); });
      if (tab === "Simulator") { const render = summary => renderSimulatorScreen(content, { summary, onStart: config => { const simRun = services.simulator.create(config); services.simulator.record(simRun, { dt: 1, damage: 0, heat: 0, energy: 100 }); render(services.simulator.summary(simRun)); } }); render(); }
      if (tab === "Statistiken") renderStatistics(content, metaSave.statistics, metaSave.records);
      if (tab === "Einstellungen") renderSettingsScreen(content, metaSave.settings, async settings => { for (const [code, action] of Object.entries(settings.bindings)) input.rebind(action, code); await services.save.update(save => { save.settings = structuredClone(settings); }); });
      if (tab === "Bergung") { const signal = services.wreckSignals.visible(metaSave.wreckSignals)[0]; if (!signal) content.innerHTML = `<div class="hangar-placeholder"><strong>KEIN AKTIVES WRACK-SIGNAL</strong><span>Legendäre verlorene Prototypen erscheinen nach dem nächsten Run.</span></div>`; else { const mission = services.salvageMissions.create(signal); renderSalvageMission(content, mission, () => game.start("standard")); } }
      if (tab === "Run starten") { const step = services.onboarding.current(metaSave); if (step) content.append(createTutorialCallout(step, { onDismiss: () => {}, onSkip: async () => { await services.onboarding.skip(); metaSave = await services.save.load(); hangar.render(); } })); }
    }
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
