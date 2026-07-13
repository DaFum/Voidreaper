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
import { createEmptyLoadout, createLoadoutService } from "../features/equipment/loadout-service.js";
import { createUnlockService } from "../features/research/unlock-service.js";
import { SHIPS } from "../content/ships/index.js";
import { WEAPONS } from "../content/weapons/index.js";
import { REACTORS } from "../content/reactors/reactors.js";
import { MODULES } from "../content/modules/index.js";
import { createHangarScreen } from "../ui/screens/hangar-screen.js";
import { attachStartMenuToggle } from "../ui/screens/start-menu-toggle.js";
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
import { ASSEMBLY_ACTIONS } from "../input/action-bindings.js";
import { createIdService } from "../core/ids.js";
import { createBlueprintService } from "../features/ship-assembly/blueprints/blueprint-service.js";
import { createBlueprintThumbnailService } from "../features/ship-assembly/blueprints/blueprint-thumbnail-service.js";
import { encodeBlueprint, decodeBlueprint } from "../features/ship-assembly/blueprints/blueprint-codec.js";
import { validateBlueprint } from "../features/ship-assembly/blueprints/blueprint-validator.js";
import { createAssemblyDebugService } from "../features/ship-assembly/debug/assembly-debug-service.js";
import { createAssemblyDebugScenarios } from "../features/ship-assembly/debug/assembly-debug-scenarios.js";
import { createAssemblyErrorBoundary } from "../features/ship-assembly/model/assembly-error-boundary.js";
import { createAssemblyWorkbenchScreen } from "../ui/ship-assembly/assembly-workbench-screen.js";
import { createAssemblyCanvasController } from "../ui/ship-assembly/assembly-canvas-controller.js";
import { getViewModeOverlay, renderAssemblyToolbar, renderViewModeOverlay } from "../ui/ship-assembly/assembly-view-modes.js";
import { portAccessibilityLabel } from "../ui/ship-assembly/port-overlay.js";
import { renderAssemblyInspector } from "../ui/ship-assembly/assembly-inspector-panel.js";
import { renderBlueprintLibrary } from "../ui/ship-assembly/blueprint-library-screen.js";
import { renderBlueprintDetail } from "../ui/ship-assembly/blueprint-detail-screen.js";
import { createBlueprintImportDialog } from "../ui/ship-assembly/blueprint-import-dialog.js";
import { createQuickMountOverlay } from "../ui/ship-assembly/quick-mount-overlay.js";
import { renderPlacementPreview } from "../ui/ship-assembly/placement-preview-overlay.js";
import { adoptCombatRunState, attemptMerchantPurchase, attemptWorkshopAction, canUseWorkbenchPort, openReplacingQuickMount, prepareCheckpointResume, resetCampaignResume, subscribeWorkbenchGeometry, syncLegacyVoidShards } from "./click-path-flows.js";
import { renderLoadoutScreen } from "../ui/screens/loadout-screen.js";

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
  let currentCheckpoint = initialSave.checkpoint;
  const writeCurrentCheckpoint = async (run, nodeId) => {
    currentCheckpoint = await services.checkpoints.writeAfterNode(run, nodeId);
    return currentCheckpoint;
  };
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
  services.assemblyErrors=createAssemblyErrorBoundary();
  console.info(`[assembly] ${services.assemblyProfiles.getCounts().shipFrames} ship profiles`);
  services.unlocks = createUnlockService(initialSave.unlocks);
  services.equipment = createEquipmentRegistry();
  for (const definition of [...SHIPS, ...WEAPONS, ...REACTORS, ...MODULES]) services.equipment.register(definition);
  services.loadouts = createLoadoutService({ registry: services.equipment, tagEngine: services.tags, unlocks: services.unlocks });
  const blueprintIds=createIdService("meta-blueprints"),thumbnailService=createBlueprintThumbnailService({assemblyRenderer:services.assemblyRenderer,geometryService:{getSnapshot:()=>services.assemblyGeometry?.getSnapshot()}});services.blueprints=createBlueprintService({saveStore:services.save,idFactory:blueprintIds,thumbnailService});services.blueprints.hydrate(initialSave);
  console.info(`[content] ${SHIPS.length} ships · ${WEAPONS.length} weapons · ${REACTORS.length} reactors · ${MODULES.length} modules`);

  const controller = createGameController(services);
  if(import.meta.env.DEV){const flags=new Map(),firstModule=()=>Object.values(services.currentAssembly?.getSnapshot().nodesById??{}).find(node=>node.moduleInstanceId),buildMaximum=()=>{const run=controller.run;if(!run)return{built:false,reason:"run-required"};const rank={S:1,M:2,L:3,XL:4},definitions=services.equipment.values().filter(definition=>definition.slot!=="ship"),blocked=new Set();let attempts=0;while(Object.keys(services.currentAssembly.getSnapshot().nodesById).length<19&&attempts++<80){const snapshot=services.currentAssembly.getSnapshot(),port=Object.values(snapshot.portsById).filter(item=>!item.occupiedByNodeId&&!blocked.has(item.portId)&&(item.branchDepth??0)<4).sort((a,b)=>(a.branchDepth??0)-(b.branchDepth??0))[0];if(!port)break;const definition=definitions.filter(item=>rank[item.assembly.sizeClass]<=rank[port.sizeClass]&&item.assembly.mountTypes.includes(port.mountType)&&item.assembly.loadDemand<=port.loadCapacity&&(port.acceptedEnergyClasses??[port.energyClass,"standard"]).includes(item.assembly.energyClass)).sort((a,b)=>(b.assembly.childPorts?.length??0)-(a.assembly.childPorts?.length??0))[0];if(!definition){blocked.add(port.portId);continue;}const item={instanceId:run.ids.create("debug-item"),definitionId:definition.id,ownership:"temporary",rarity:"debug",affixes:[],sockets:[]};run.inventory.push(item);services.currentAssembly.mountModule({moduleInstanceId:item.instanceId,definitionId:definition.id,parentPort:port,assemblyProfile:definition.assembly,transform:{position:port.localPosition??{x:(port.direction?.x??0)*34,y:(port.direction?.y??0)*34},rotation:Math.atan2(port.direction?.y??0,port.direction?.x??1)}});services.assemblyGeometry.rebuildNow();}const snapshot=services.currentAssembly.getSnapshot();return{built:true,nodes:Object.keys(snapshot.nodesById).length,segments:Object.keys(snapshot.nodesById).length-1};},scenarioActions={visualGallery:()=>({cores:getCoreGeometryIds(),modules:MODULE_VISUAL_PROFILES.map(profile=>profile.rendererId),damageStates:["intact","armor-broken","core-disrupted"]}),buildMaximum,buildAsymmetric:()=>({maximum:buildMaximum(),flight:services.flightProfile?.rebuildNow()}),damageSingle:()=>{const node=firstModule();return node?services.moduleDamage.applyDamage(node.nodeId,20,"debug"):null;},bridgeSurvival:()=>{const maximum=buildMaximum();if(!maximum.built)return maximum;const snapshot=services.currentAssembly.getSnapshot(),parent=Object.values(snapshot.nodesById).find(node=>node.nodeId!==snapshot.rootNodeId&&Object.values(snapshot.nodesById).some(child=>child.parentNodeId===node.nodeId));if(!parent)return{survived:false,reason:"no-parent"};const child=Object.values(snapshot.nodesById).find(node=>node.parentNodeId===parent.nodeId);services.currentAssembly.addSecondaryConnection({sourceNodeId:child.nodeId,targetNodeId:snapshot.rootNodeId,profile:{structuralStrength:8,energyThroughput:"standard",visualConnectorType:"debug-bridge"}});services.moduleDamage.applyDamage(parent.nodeId,9999,"debug");return{survived:Boolean(services.currentAssembly.getSnapshot().nodesById[child.nodeId]),childNodeId:child.nodeId};},branchCollapse:()=>{const snapshot=services.currentAssembly?.getSnapshot(),parent=Object.values(snapshot?.nodesById??{}).find(node=>node.nodeId!==snapshot.rootNodeId&&Object.values(snapshot.nodesById).some(child=>child.parentNodeId===node.nodeId))??firstModule();return parent?services.moduleDamage.applyDamage(parent.nodeId,9999,"debug"):null;},repairRemount:()=>({detached:services.currentAssembly?.getSnapshot().detachedItems??[],resources:controller.run?.resources}),setLod:lod=>{metaSave.assemblyVisualPreferences.lod=lod;return lod;},blueprintRoundtrip:()=>{const blueprint=services.blueprints.list()[0];if(!blueprint)return{instruction:"Save a blueprint first."};return validateBlueprint(decodeBlueprint(encodeBlueprint(blueprint)),{knownDefinitionIds:new Set(services.equipment.values().map(item=>item.id)),knownShipFrameIds:new Set(SHIP_FRAME_ASSEMBLY_PROFILES.map(item=>item.id))});}};const scenarioRunner=createAssemblyDebugScenarios(scenarioActions),damage={forceState(nodeId,state){const node=services.currentAssembly.requireNode(nodeId);node.damageState=state;if(state==="armor-broken")node.armorIntegrity=0;if(state==="core-disrupted")node.coreIntegrity=node.maxCoreIntegrity*.3;services.currentAssembly.publishDamageChange(nodeId);return node;}},debugFlags={set:(key,value)=>flags.set(key,value),snapshot:()=>Object.fromEntries(flags)},settings={setTemporary:(key,value)=>{flags.set(key,value);return value;}},blueprints={exportCurrent:()=>{const blueprint=services.blueprints.list()[0];return blueprint?encodeBlueprint(blueprint):null;},importCode:code=>validateBlueprint(decodeBlueprint(code),{knownDefinitionIds:new Set(services.equipment.values().map(item=>item.id)),knownShipFrameIds:new Set(SHIP_FRAME_ASSEMBLY_PROFILES.map(item=>item.id))})};services.assemblyDebug=createAssemblyDebugService({inventory:{grantDebugItem:definitionId=>{const run=controller.run,definition=services.equipment.require(definitionId);if(!run)return null;const item={instanceId:run.ids.create("debug-item"),definitionId:definition.id,ownership:"temporary",rarity:"debug",affixes:[],sockets:[]};run.inventory.push(item);services.events.emit("run-item-acquired",{item,source:"debug"});return item;}},damage,assembly:()=>services.currentAssembly,defaultBridge:{structuralStrength:8,energyThroughput:"standard",visualConnectorType:"debug-bridge"},debugFlags,settings,scenarios:scenarioRunner,blueprints});globalThis.__VOIDREAPER_DEBUG__={...(globalThis.__VOIDREAPER_DEBUG__??{}),assembly:{...services.assemblyDebug,getGeometry:()=>services.assemblyGeometry?.getSnapshot()??null,getHitZones:()=>services.hitZones?.all()??[],getFlightProfile:()=>services.flightProfile?.getProfile()??null,getPending:()=>services.pendingMounts?.values()??[],getQuickMount:()=>services.quickMount?.session??null,getWorkbench:()=>services.assemblyWorkbench?.model()??null,scenarios:scenarioRunner}};}
  const input = createInputController({ eventBus: events, bindings: metaSave.settings.bindings, isQuickMount: () => Boolean(services.quickMount?.session) });
  let quickMountHost=null;const renderQuickMount=()=>{const session=services.quickMount?.session;if(!session||!quickMountHost)return;const suggestion=session.suggestions[session.selectedIndex],definition=services.equipment.require(session.pendingMount.definitionId),overlay=quickMountHost.__overlay;overlay.render({name:definition.name??definition.id,reasons:suggestion.reasons,deltas:[["POSITION",`${session.selectedIndex+1}/${session.suggestions.length}`],["MASSE",suggestion.flightDelta.totalMass?.toFixed?.(1)??"—"],["BALANCE",suggestion.metrics.balance?.toFixed?.(2)??"—"],["ENERGIE",suggestion.metrics.energyPath?.toFixed?.(2)??"—"],["SCHUTZ",suggestion.metrics.protection?.toFixed?.(2)??"—"],["RISIKO",suggestion.metrics.collisionRisk?"HOCH":"NIEDRIG"]],details:[...(definition.tags??[]).map(tag=>typeof tag==="string"?tag:tag.id),`Blueprint ${suggestion.blueprintMatch??"frei"}`]});drawQuickMountPreview();};const drawQuickMountPreview=()=>{const session=services.quickMount?.session;if(!session||!quickMountHost)return;renderPlacementPreview(quickMountHost.__overlay.canvas.getContext("2d"),{snapshot:services.assemblyGeometry.getSnapshot(),suggestion:session.suggestions[session.selectedIndex],assemblyRenderer:services.assemblyRenderer,time:quickMountClock});};let quickMountFrame=null,quickMountClock=0,quickMountLast=0;const animateQuickMount=now=>{if(!quickMountHost){quickMountFrame=null;return;}quickMountClock+=Math.min(.1,(now-quickMountLast)/1000);quickMountLast=now;drawQuickMountPreview();quickMountFrame=requestAnimationFrame(animateQuickMount);};const closeQuickMount=()=>{if(quickMountFrame)cancelAnimationFrame(quickMountFrame);quickMountFrame=null;quickMountHost?.remove();quickMountHost=null;};events.on("run-item-acquired",({item,source,run:owningRun})=>{if(owningRun&&owningRun!==controller.run)return;const definition=services.equipment.require(item.definitionId),pending=services.pendingMounts.queue({itemInstance:item,profile:definition.assembly,source,acquiredAt:(owningRun??controller.run)?.time??0});if(pending.requiresWorkbench){item.stored=true;legacyRuntime.ui.toast("Großmodul für die Werkbank eingelagert.");return;}const opened=openReplacingQuickMount({active:Boolean(quickMountHost||quickMountFrame),close:closeQuickMount,open:()=>controller.openPendingMount(pending,{moduleProfile:{...definition.assembly,definitionId:definition.id,tags:definition.tags},blueprint:services.blueprints.getActiveId()?services.blueprints.require(services.blueprints.getActiveId()):null,settings:{pauseOnMount:metaSave.settings.pauseOnMount??true}})});if(!opened.opened)return;quickMountHost=document.createElement("div");document.body.append(quickMountHost);quickMountHost.__overlay=createQuickMountOverlay(quickMountHost,{onAction:action=>{if(action==="previous")services.quickMount.previous();if(action==="next")services.quickMount.next();if(action==="confirm"){services.quickMount.confirm();closeQuickMount();return;}if(action==="defer"){services.quickMount.defer();closeQuickMount();return;}renderQuickMount();}});renderQuickMount();if(!globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches){quickMountLast=performance.now();quickMountFrame=requestAnimationFrame(animateQuickMount);}});
  input.start();
  const inspector = createBuildInspector(document.querySelector("#build-inspector"), services);
  const game = legacyRuntime.game;
  const ui = legacyRuntime.ui;
  legacyRuntime.configureEvolutionEffects((effectId, player) => effects.execute({ id: effectId }, { player, run: controller.run }));
  const getAssemblyLod = () => metaSave.assemblyVisualPreferences?.lod === "auto" ? "ultra" : metaSave.assemblyVisualPreferences?.lod;
  legacyRuntime.configureShipRenderer((context,player,legacyGame)=>{const geometry=services.assemblyGeometry?.getSnapshot();if(!geometry?.coreGeometry)return false;const rendered=services.assemblyRenderer.renderPlayerShip(context,{geometrySnapshot:geometry,position:player,rotation:player.angle+Math.PI/2,time:legacyGame.time,buildAnimations:services.buildAnimations?.snapshot?.()??[],movement:{x:player.vx,y:player.vy,dodging:player.iframes>0},lodOptions:{userSetting:getAssemblyLod()}});if(rendered&&player.shield>0){context.strokeStyle="#4f6df5";context.shadowColor="#4f6df5";context.shadowBlur=14;context.lineWidth=1.5;context.beginPath();context.arc(player.x,player.y,player.r+8+Math.sin(legacyGame.time*4)*2,0,Math.PI*2);context.stroke();context.shadowBlur=0;}return rendered;});
  // GPU environment stage (PixiJS) below the #game canvas. Loaded lazily and
  // fire-and-forget: until it is ready (or if WebGL is unavailable) the legacy
  // runtime keeps drawing its canvas backdrop.
  void (async () => {
    let stageCanvas = null;
    try {
      const gameCanvas = document.getElementById("game");
      if (!gameCanvas?.parentNode) return;
      const { createEnvironmentStage } = await import("../render/pixi/environment-stage.js");
      stageCanvas = document.createElement("canvas");
      stageCanvas.id = "environment";
      stageCanvas.setAttribute("aria-hidden", "true");
      gameCanvas.parentNode.insertBefore(stageCanvas, gameCanvas);
      const environmentStage = await createEnvironmentStage({
        canvas: stageCanvas,
        reducedMotion: globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
      });
      document.body.classList.add("gpu-environment");
      legacyRuntime.configureEnvironmentRenderer(frame => environmentStage.render(frame));
      console.info("[render] PixiJS environment stage active");
      // combat FX overlay (particles, shockwaves, bloom) above #game — optional
      // on top of the environment stage, with its own fallback to the 2D path
      let fxCanvas = null;
      try {
        const { createCombatFxStage } = await import("../render/pixi/combat-fx-stage.js");
        fxCanvas = document.createElement("canvas");
        fxCanvas.id = "combat-fx";
        fxCanvas.setAttribute("aria-hidden", "true");
        gameCanvas.after(fxCanvas);
        const combatFxStage = await createCombatFxStage({ canvas: fxCanvas, gameCanvas });
        legacyRuntime.configureCombatFxRenderer(combatFxStage);
        console.info("[render] PixiJS combat FX stage active");
      } catch (fxError) {
        fxCanvas?.remove();
        console.warn("[render] PixiJS combat FX stage unavailable — 2D particles/bloom remain active", fxError);
      }
    } catch (error) {
      stageCanvas?.remove();
      document.body.classList.remove("gpu-environment");
      console.warn("[render] PixiJS environment stage unavailable — canvas backdrop remains active", error);
    }
  })();
  legacyRuntime.configurePlayerDamageRouter((_player,damage)=>{const geometry=services.assemblyGeometry?.getSnapshot(),target=(geometry?.nodes??[]).filter(node=>!node.isRoot).sort((a,b)=>((b.worldPosition.x)*(b.worldPosition.x) + (b.worldPosition.y)*(b.worldPosition.y))-((a.worldPosition.x)*(a.worldPosition.x) + (a.worldPosition.y)*(a.worldPosition.y)))[0];return target&&services.moduleDamage?services.moduleDamage.applyDamage(target.nodeId,damage,"legacy-contact").remainingDamage:damage;});
  const hangarRoot = document.querySelector("#hangar");
  const startMenu = attachStartMenuToggle(document.querySelector("#start"), { openButton: document.querySelector("#menuopenbtn"), closeButton: document.querySelector("#menuclosebtn") });
  // The game-over screen's "Hangar" button routes through the legacy UI.menu(), which only
  // shows #start — jump straight to the menu view so the button keeps landing in the hangar.
  document.querySelector("#menubtn")?.addEventListener("click", () => startMenu.open());
  let previewRun;
  let mapScreen;
  let activeCampaignNodeId = null;
  let originalStartWave;
  const showAssemblyWorkbench = () => {
    if (!services.assemblyWorkbench || !services.currentAssembly) return legacyRuntime.ui.toast("Werkbank ist nach dem ersten Kampfeinsatz verfügbar.");
    const stage = hangarRoot.querySelector(".hangar-content");
    const workbench = services.assemblyWorkbench;
    let movingBranch = false;
    let screen, cameraController, frameHandle = null, resizeObserver = null, model = null, geometryById = new Map();
    workbench.open({ source: "sector-map" });
    const equipmentDefinition = definitionId => { try { return services.equipment.require(definitionId); } catch { return null; } };
    const moduleProfileFor = item => { const definition = item && equipmentDefinition(item.definitionId); return definition ? { ...definition.assembly, definitionId: definition.id, tags: definition.tags } : null; };
    const evaluatePort = (port, profile) => profile && services.compatibility ? services.compatibility.evaluate({ state: model.assembly, moduleProfile: profile, port, geometrySnapshot: model.geometry }) : null;
    let unsubscribeGeometry = null;
    const cleanup = () => { if (frameHandle) cancelAnimationFrame(frameHandle); frameHandle = null; resizeObserver?.disconnect(); cameraController?.destroy(); screen?.destroy?.(); unsubscribeGeometry?.(); unsubscribeGeometry = null; };
    const render = () => {
      model = workbench.model();
      geometryById = new Map(model.geometry.nodes.map(node => [node.nodeId, node]));
      const looseInventory = model.inventory.filter(item => !Object.values(model.assembly.nodesById).some(node => node.moduleInstanceId === item.instanceId));
      const selectedItem = looseInventory.find(item => item.instanceId === model.session.selectedItemId) ?? null;
      const placementProfile = movingBranch ? null : moduleProfileFor(selectedItem);
      let validPortCount = 0;
      const ports = Object.values(model.assembly.portsById).map(port => {
        const parent = geometryById.get(port.parentNodeId);
        const local = port.localPosition ?? { x: (port.direction?.x ?? 0) * 34, y: (port.direction?.y ?? 0) * 34 };
        const compatibility = port.occupiedByNodeId ? null : evaluatePort(port, placementProfile);
        let state = "free", reasonText = "";
        if (compatibility) { state = compatibility.compatible ? "valid" : "invalid"; reasonText = compatibility.compatible ? "" : compatibility.reasonLabels.join(", "); }
        else if (movingBranch && !port.occupiedByNodeId) state = "valid";
        if (state === "valid") validPortCount++;
        return { ...port, state, reasonText, position: { x: (parent?.worldPosition.x ?? 0) + local.x, y: (parent?.worldPosition.y ?? 0) + local.y }, label: portAccessibilityLabel(port, compatibility ?? undefined) };
      });
      screen.renderInventory(looseInventory.map(item => { const definition = equipmentDefinition(item.definitionId); return { ...item, label: definition?.name ?? item.definitionId, sizeClass: definition?.assembly?.sizeClass }; }), model.session.selectedItemId);
      screen.renderPorts(ports, { selectedPortId: model.session.selectedPortId, selectedNodeId: model.session.selectedNodeId });
      renderAssemblyToolbar(stage.querySelector('[data-role="modes"]'), model.session.viewMode, mode => { workbench.setViewMode(mode); render(); });
      const selected = model.assembly.nodesById[model.session.selectedNodeId];
      const selectedPort = model.assembly.portsById[model.session.selectedPortId];
      if (movingBranch) screen.setHint("Freien Zielport wählen, um den Ast zu versetzen.");
      else if (selectedItem) screen.setHint(validPortCount ? `${validPortCount} kompatible Ports leuchten gold — Port anklicken zum Montieren.` : "Kein freier Port passt zu diesem Modul.");
      else if (selected) screen.setHint("Aktionen im Inspektor: Drehen, Ast versetzen, Demontieren.");
      else screen.setHint("Modul im Inventar wählen oder verbautes Modul anklicken. Ziehen verschiebt die Ansicht, Mausrad zoomt.");
      const inspector = document.createElement("div");
      const consequence = selected ? workbench.previewConsequence() : { allowed: false, warnings: [] };
      let deltas = [], title;
      if (selected) { const definition = equipmentDefinition(selected.definitionId); title = definition?.name ?? selected.definitionId; deltas = [["PANZERUNG", `${Math.round(selected.armorIntegrity ?? 0)} / ${Math.round(selected.maxArmorIntegrity ?? 0)}`], ["KERN", `${Math.round(selected.coreIntegrity ?? 0)}`], ["MASSE", selected.mass ?? "—"], ["ZUSTAND", selected.damageState === "intact" ? "INTAKT" : selected.damageState ?? "—"]]; }
      else if (selectedItem) { const definition = equipmentDefinition(selectedItem.definitionId); title = definition?.name ?? selectedItem.definitionId; const assembly = definition?.assembly ?? {}; deltas = [["GRÖSSE", assembly.sizeClass ?? "—"], ["ENERGIE", assembly.energyClass ?? "—"], ["LAST", assembly.loadDemand ?? "—"], ["MONTAGE", (assembly.mountTypes ?? []).join(" / ") || "—"]]; }
      else if (selectedPort) { title = `${selectedPort.sizeClass}-PORT`; deltas = [["KLASSE", selectedPort.sizeClass], ["ENERGIE", selectedPort.energyClass ?? "—"], ["TRAGLAST", selectedPort.loadCapacity ?? "—"], ["TYP", selectedPort.mountType ?? "—"]]; }
      renderAssemblyInspector(inspector, { node: selected, port: selectedPort, item: selectedItem, title, deltas, warnings: consequence.warnings, actions: { rotate: Boolean(selected) && consequence.allowed, moveBranch: Boolean(selected), dismantle: Boolean(selected) && consequence.allowed } });
      screen.setInspector(inspector);
    };
    const draw = clock => {
      const canvas = screen.canvas, dpr = Math.min(2, globalThis.devicePixelRatio ?? 1);
      const width = canvas.width / dpr, height = canvas.height / dpr, camera = cameraController.camera;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(camera.zoom, camera.zoom);
      ctx.translate(camera.offset.x, camera.offset.y);
      services.assemblyRenderer.renderPlayerShip(ctx, { geometrySnapshot: model.geometry, position: { x: 0, y: 0 }, time: clock, buildAnimations: services.buildAnimations?.snapshot?.() ?? [], lodOptions: { userSetting: getAssemblyLod() } });
      const selectedGeometry = geometryById.get(workbench.session?.selectedNodeId);
      if (selectedGeometry) { ctx.save(); ctx.strokeStyle = "#ffc857"; ctx.lineWidth = 1.5 / camera.zoom; ctx.setLineDash([6, 5]); ctx.lineDashOffset = -clock * 14; ctx.beginPath(); ctx.arc(selectedGeometry.worldPosition.x, selectedGeometry.worldPosition.y, (selectedGeometry.geometry?.size ?? 14) + 9, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
      renderViewModeOverlay(ctx, getViewModeOverlay(workbench.session?.viewMode ?? "normal", { assembly: model.assembly, geometry: model.geometry, flightProfile: services.flightProfile?.getProfile() }));
      ctx.restore();
      screen.portsLayer.style.transform = `scale(${camera.zoom}) translate(${camera.offset.x}px, ${camera.offset.y}px)`;
    };
    screen = createAssemblyWorkbenchScreen(stage, { onAction: (action, data) => {
      if (action === "close") { cleanup(); workbench.close(); showCampaignMap(); return; }
      if (action === "zoom-in") { cameraController.zoomBy(.15); return; }
      if (action === "zoom-out") { cameraController.zoomBy(-.15); return; }
      if (action === "reset-view") { cameraController.resetView(); return; }
      if (action === "select-item") { movingBranch = false; workbench.selectItem(workbench.session.selectedItemId === data.id ? null : data.id); }
      if (action === "select-node") { movingBranch = false; workbench.selectNode(data.id); }
      if (action === "select-port") {
        const port = services.currentAssembly.getSnapshot().portsById[data.id];
        if (canUseWorkbenchPort(port)) {
          workbench.selectPort(data.id);
          const transform = { position: port.localPosition ?? { x: (port.direction?.x ?? 0) * 34, y: (port.direction?.y ?? 0) * 34 }, rotation: Math.atan2(port.direction?.y ?? 0, port.direction?.x ?? 1) };
          if (movingBranch && workbench.session.selectedNodeId) { workbench.move(transform, { branch: true }); movingBranch = false; }
          else if (workbench.session.selectedItemId) {
            const profile = moduleProfileFor(model.inventory.find(item => item.instanceId === workbench.session.selectedItemId));
            const compatibility = evaluatePort(port, profile);
            if (compatibility && !compatibility.compatible) { legacyRuntime.ui.toast(`Nicht montierbar: ${compatibility.reasonLabels.join(", ")}`); render(); return; }
            const nodeId = workbench.mount(transform);
            if (nodeId) workbench.selectNode(nodeId);
          }
        }
      }
      if (action === "rotate" && workbench.session.selectedNodeId) workbench.rotate((services.currentAssembly.requireNode(workbench.session.selectedNodeId).localRotation ?? 0) + Math.PI / 8);
      if (action === "move-branch") { movingBranch = true; legacyRuntime.ui.toast("Freien Zielport wählen, um den Ast zu versetzen."); }
      if (action === "dismantle" && workbench.session.selectedNodeId) workbench.dismantle(false);
      render();
    } });
    cameraController = createAssemblyCanvasController({ canvas: screen.canvas });
    const fitCanvas = () => { const dpr = Math.min(2, globalThis.devicePixelRatio ?? 1), { clientWidth, clientHeight } = screen.canvas; if (clientWidth && clientHeight) { screen.canvas.width = Math.round(clientWidth * dpr); screen.canvas.height = Math.round(clientHeight * dpr); } };
    resizeObserver = globalThis.ResizeObserver ? new ResizeObserver(fitCanvas) : null;
    resizeObserver?.observe(screen.canvas);
    fitCanvas();
    unsubscribeGeometry = subscribeWorkbenchGeometry({ events: services.events, isActive: () => Boolean(workbench.session && screen.canvas.isConnected), render });
    render();
    let lastFrame = performance.now(), clock = controller.run?.time ?? 0;
    const reducedMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const frame = now => {
      if (!screen.canvas.isConnected || !workbench.session) { cleanup(); return; }
      const dt = Math.min(.1, (now - lastFrame) / 1000);
      lastFrame = now; if (!reducedMotion) clock += dt;
      services.buildAnimations?.update(dt);
      draw(clock);
      frameHandle = requestAnimationFrame(frame);
    };
    frameHandle = requestAnimationFrame(frame);
  };
  const showCampaignMap = () => {
    if (!previewRun) {
      previewRun = createRunState({ seed: Date.now(), mode: "campaign", campaignPathId: metaSave.selectedCampaignPath });
      previewRun.heat = createHeatState();
      previewRun.corruption = createCorruptionState();
      previewRun.resources.scrap = 80;
      previewRun.resources.flux = 6;
      previewRun.services = services;
      services.sectors.start(previewRun);
    }
    const stage = hangarRoot.querySelector(".hangar-content");
    mapScreen = createSectorMapScreen(stage, { onWorkbench: showAssemblyWorkbench, onConfirm: node => {
      if (!services.sectors.enter(previewRun, node.id)) return;
      const finish = async () => { services.sectors.complete(previewRun, node.id); await writeCurrentCheckpoint(previewRun, node.id).catch(() => {}); showCampaignMap(); };
      if (["combat", "elite", "salvage", "mid-boss", "boss", "extraction"].includes(node.type)) {
        activeCampaignNodeId = node.id;
        if (game.player && game.wave > 0) { game.state = "run"; ui.show("hud"); originalStartWave(game.wave + 1); }
        else game.start("standard");
        return;
      }
      if (node.type === "merchant") {
        const merchant = createMerchantService({ modules: MODULES, weapons: WEAPONS, reactors: REACTORS, currencyService: services.currency, eventBus: events });
        const showMerchant = offers => renderMerchantScreen(stage, {
          offers,
          resources: previewRun.resources,
          onBuy: offer => attemptMerchantPurchase({ merchant, run: previewRun, offer, finish, onRejected: () => legacyRuntime.ui.toast("Nicht genügend Ressourcen.") }),
          onReroll: () => { const offers = merchant.reroll(previewRun, node.seed, node.regionIndex); if (offers) showMerchant(offers); },
          onLeave: finish
        });
        showMerchant(merchant.roll(node.seed, node.regionIndex));
        return;
      }
      if (node.type === "workshop") {
        const workshop = createWorkshopService({ affixRoller: services.affixes, eventBus: events }); const session = workshop.open(node.regionIndex); const target = previewRun.inventory[0] ?? { ...REACTORS[0], rarity: "rare", itemPower: 100, affixes: [] };
        const showWorkshop = () => renderWorkshopScreen(stage, { service: workshop, session, target, onAction: (action, item) => attemptWorkshopAction({ workshop, session, action, target: item, payload: { rng: previewRun.rng, sector: node.regionIndex, repairService: services.repairs }, finish, onContinue: showWorkshop }), onLeave: finish });
        showWorkshop(); return;
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
    currencies: () => metaSave.currencies,
    checkpoint: () => currentCheckpoint,
    isUnlocked: definition => services.unlocks.isUnlocked(definition),
    onStart: () => { previewRun = resetCampaignResume(services); activeCampaignNodeId = null; showCampaignMap(); },
    onResume: checkpoint => { const hydrated = services.checkpoints.hydrate(checkpoint, services); if (!hydrated) return; previewRun = hydrated.run; prepareCheckpointResume({ services, controller, game, run: previewRun }); showCampaignMap(); },
    renderTab: (tab, content) => {
      if (tab === "Loadout") {
        const loadout = metaSave.loadouts.primary?.slots ? metaSave.loadouts.primary : createEmptyLoadout();
        renderLoadoutScreen(content, services.loadouts.inspect(loadout), loadout, {
          blueprints: services.blueprints.list(),
          activeBlueprintId: services.blueprints.getActiveId(),
          onBlueprintChange: async id => {
            if (id) await services.blueprints.setActive(id);
            else await services.save.update(save => { save.activeBlueprintId = null; });
            metaSave = await services.save.load();
            services.blueprints.hydrate(metaSave);
            hangar.render();
          }
        });
      }
      if (tab === "Forschung") renderResearchScreen(content, RESEARCH_TREE, { purchased: metaSave.research, canPurchase: node => services.research.canPurchase(metaSave, node), onPurchase: async id => { await services.research.purchase(id); metaSave = await services.save.load(); syncLegacyVoidShards({ persistence: legacyRuntime.persistence, root: document, currencies: metaSave.currencies }); hangar.render(); } });
      if (tab === "Baupläne") {
        const refreshBlueprints = async () => { metaSave = await services.save.load(); services.blueprints.hydrate(metaSave); };
        const showLibrary = () => renderBlueprintLibrary(content, {
          blueprints: services.blueprints.list(),
          onOpen: showDetail,
          onFavorite: async (id, favorite) => { await services.save.update(save => { save.shipBlueprints[id].favorite = favorite; }); await refreshBlueprints(); showLibrary(); },
          onCreate: async () => { if (!services.currentAssembly) return legacyRuntime.ui.toast("Starte zuerst einen Run."); await services.blueprints.saveFromAssembly({ name: `${services.currentAssembly.getSnapshot().shipFrameId} Konstruktion`, assemblySnapshot: services.currentAssembly.getSnapshot(), geometrySnapshot: services.assemblyGeometry.getSnapshot() }); await refreshBlueprints(); showLibrary(); },
          onImport: () => { const host = document.createElement("div"); content.append(host); createBlueprintImportDialog(host, { validate: blueprint => validateBlueprint(blueprint, { knownDefinitionIds: new Set(services.equipment.values().map(item => item.id)), knownShipFrameIds: new Set(SHIP_FRAME_ASSEMBLY_PROFILES.map(item => item.id)) }), onImport: async blueprint => { await services.blueprints.importBlueprint(blueprint); await refreshBlueprints(); showLibrary(); } }).open(); }
        });
        const showDetail = id => renderBlueprintDetail(content, {
          blueprint: services.blueprints.require(id),
          active: services.blueprints.getActiveId() === id,
          onAction: async action => {
            if (action === "back") return showLibrary();
            if (action === "activate") await services.blueprints.setActive(id);
            if (action === "rename") { const name = prompt("Neuer Name", services.blueprints.require(id).name); if (name === null) return; await services.blueprints.rename(id, name); }
            if (action === "duplicate") { const copy = await services.blueprints.duplicate(id); await refreshBlueprints(); return showDetail(copy.blueprintId); }
            if (action === "variant") { if (!services.currentAssembly) return legacyRuntime.ui.toast("Varianten benötigen eine aktive Konstruktion."); const name = prompt("Name der Variante", "Variante"); if (name === null) return; await services.blueprints.createVariant(id, name, services.currentAssembly.getSnapshot()); }
            if (action === "export") { const code = encodeBlueprint(services.blueprints.require(id)); if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(code); else prompt("Bauplan-Code kopieren", code); legacyRuntime.ui.toast("Bauplan-Code kopiert."); return; }
            if (action === "delete") { if (!confirm(`Bauplan ${services.blueprints.require(id).name} löschen?`)) return; await services.blueprints.delete(id); await refreshBlueprints(); return showLibrary(); }
            await refreshBlueprints(); showDetail(id);
          }
        });
        showLibrary();
      }
      if (tab === "Codex") { const show = filters => renderCodexScreen(content, { entries: services.codex.filter(metaSave, filters), filters, onFilter: show }); show({}); }
      if (tab === "Herausforderungen") renderChallengesScreen(content, [...CHALLENGES, ...createMasteryChallenges(SHIPS, WEAPONS)], metaSave.challenges);
      if (tab === "Prototypen") { const vault = createPrototypeVault(metaSave); const show = filters => renderPrototypeVault(content, { items: vault.filter(filters), filters, capacity: vault.capacity, overflowCount: Object.keys(metaSave.overflow).length, onFilter: show, onFavorite: async id => { vault.favorite(id, !metaSave.inventory[id].favorite); await services.save.save(metaSave); hangar.render(); }, onDismantle: async id => { vault.dismantle(id); await services.save.save(metaSave); hangar.render(); } }); show({}); }
      if (tab === "Kampagnen") renderCampaignSelect(content, services.campaignPaths.available(metaSave), async id => { await services.save.update(save => { services.campaignPaths.select(save, id); }); metaSave = await services.save.load(); hangar.show("Run starten"); });
      if (tab === "Simulator") { const render = (config = {}, summary) => renderSimulatorScreen(content, { config, summary, onStart: nextConfig => { const simRun = services.simulator.create(nextConfig); render(nextConfig, services.simulator.simulate(simRun)); } }); render(); }
      if (tab === "Statistiken") renderStatistics(content, metaSave.statistics, metaSave.records);
      if (tab === "Einstellungen") renderSettingsScreen(content, metaSave.settings, async settings => { for (const [code, action] of Object.entries(settings.bindings)) input.rebind(action, code); await services.save.update(save => { save.settings = structuredClone(settings); }); });
      if (tab === "Bergung") { const signal = services.wreckSignals.visible(metaSave.wreckSignals)[0]; if (!signal) content.innerHTML = `<div class="hangar-placeholder"><strong>KEIN AKTIVES WRACK-SIGNAL</strong><span>Legendäre verlorene Prototypen erscheinen nach dem nächsten Run.</span></div>`; else { const mission = services.salvageMissions.create(signal); renderSalvageMission(content, mission, () => game.start("standard")); } }
      if (tab === "Run starten") { const step = services.onboarding.current(metaSave); if (step) content.append(createTutorialCallout(step, { onDismiss: () => {}, onSkip: async () => { await services.onboarding.skip(); metaSave = await services.save.load(); hangar.render(); } })); }
    }
  });
  ui.renderHangar = () => hangar.render();

  // Merchant hull repair targets the map preview run, but between campaign
  // combat nodes the legacy game.player keeps its damaged hull — heal it too,
  // or the paid repair never reaches the next fight.
  events.on("merchant-service-applied", ({ serviceId }) => {
    if (serviceId === "repair" && game.player) game.player.hp = game.player.maxHp;
  });
  const originalReset = game.reset.bind(game);
  game.reset = mode => {
    originalReset(mode);
    controller.attachLegacy(game);
  };
  // Dying inside a campaign node must invalidate the checkpoint, otherwise
  // "Fortsetzen" replays the pre-death state as a free death-undo.
  const originalGameOver = game.gameOver.bind(game);
  game.gameOver = () => {
    originalGameOver();
    if (!activeCampaignNodeId) return;
    activeCampaignNodeId = null;
    currentCheckpoint = null;
    previewRun = resetCampaignResume(services);
    void services.checkpoints.clear("player-death").catch(() => {});
    hangar.render();
  };
  originalStartWave = game.startWave.bind(game);
  game.startWave = wave => {
    if (activeCampaignNodeId && wave > 1) {
      adoptCombatRunState(previewRun, controller.run);
      services.sectors.complete(previewRun, activeCampaignNodeId);
      void writeCurrentCheckpoint(previewRun, activeCampaignNodeId).catch(() => {});
      activeCampaignNodeId = null;
      game.state = "sector-map";
      ui.show("start");
      hangar.render();
      showCampaignMap();
      return;
    }
    originalStartWave(wave);
  };
  // Reset the trigger engine's chain budget once per simulation step (the legacy
  // loop can run up to 5 catch-up steps per frame), otherwise the cumulative
  // counter permanently mutes triggers after 100 effects.
  const originalStep = game.step.bind(game);
  game.step = dt => {
    services.triggers?.beginStep?.();
    originalStep(dt);
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
    if(services.quickMount?.session){if(action===ASSEMBLY_ACTIONS.PREVIOUS_SUGGESTION)services.quickMount.previous();if(action===ASSEMBLY_ACTIONS.NEXT_SUGGESTION)services.quickMount.next();if(action===ASSEMBLY_ACTIONS.CONFIRM){services.quickMount.confirm();closeQuickMount();return;}if(action===ASSEMBLY_ACTIONS.DEFER){services.quickMount.defer();closeQuickMount();return;}renderQuickMount();return;}
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
