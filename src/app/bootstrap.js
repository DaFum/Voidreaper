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
import { renderAssemblyToolbar } from "../ui/ship-assembly/assembly-view-modes.js";
import { portAccessibilityLabel } from "../ui/ship-assembly/port-overlay.js";
import { renderAssemblyInspector } from "../ui/ship-assembly/assembly-inspector-panel.js";
import { renderBlueprintLibrary } from "../ui/ship-assembly/blueprint-library-screen.js";
import { createBlueprintImportDialog } from "../ui/ship-assembly/blueprint-import-dialog.js";
import { createQuickMountOverlay } from "../ui/ship-assembly/quick-mount-overlay.js";
import { renderPlacementPreview } from "../ui/ship-assembly/placement-preview-overlay.js";

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
  services.assemblyErrors=createAssemblyErrorBoundary();
  console.info(`[assembly] ${services.assemblyProfiles.getCounts().shipFrames} ship profiles`);
  services.unlocks = createUnlockService(initialSave.unlocks);
  services.equipment = createEquipmentRegistry();
  for (const definition of [...SHIPS, ...WEAPONS, ...REACTORS, ...MODULES]) services.equipment.register(definition);
  const blueprintIds=createIdService("meta-blueprints"),thumbnailService=createBlueprintThumbnailService({assemblyRenderer:services.assemblyRenderer,geometryService:{getSnapshot:()=>services.assemblyGeometry?.getSnapshot()}});services.blueprints=createBlueprintService({saveStore:services.save,idFactory:blueprintIds,thumbnailService});services.blueprints.hydrate(initialSave);
  console.info(`[content] ${SHIPS.length} ships · ${WEAPONS.length} weapons · ${REACTORS.length} reactors · ${MODULES.length} modules`);

  const controller = createGameController(services);
  if(import.meta.env.DEV){const flags=new Map(),firstModule=()=>Object.values(services.currentAssembly?.getSnapshot().nodesById??{}).find(node=>node.moduleInstanceId),buildMaximum=()=>{const run=controller.run;if(!run)return{built:false,reason:"run-required"};const rank={S:1,M:2,L:3,XL:4},definitions=services.equipment.values().filter(definition=>definition.slot!=="ship"),blocked=new Set();let attempts=0;while(Object.keys(services.currentAssembly.getSnapshot().nodesById).length<19&&attempts++<80){const snapshot=services.currentAssembly.getSnapshot(),port=Object.values(snapshot.portsById).filter(item=>!item.occupiedByNodeId&&!blocked.has(item.portId)&&(item.branchDepth??0)<4).sort((a,b)=>(a.branchDepth??0)-(b.branchDepth??0))[0];if(!port)break;const definition=definitions.filter(item=>rank[item.assembly.sizeClass]<=rank[port.sizeClass]&&item.assembly.mountTypes.includes(port.mountType)&&item.assembly.loadDemand<=port.loadCapacity&&(port.acceptedEnergyClasses??[port.energyClass,"standard"]).includes(item.assembly.energyClass)).sort((a,b)=>(b.assembly.childPorts?.length??0)-(a.assembly.childPorts?.length??0))[0];if(!definition){blocked.add(port.portId);continue;}const item={instanceId:run.ids.create("debug-item"),definitionId:definition.id,ownership:"temporary",rarity:"debug",affixes:[],sockets:[]};run.inventory.push(item);services.currentAssembly.mountModule({moduleInstanceId:item.instanceId,definitionId:definition.id,parentPort:port,assemblyProfile:definition.assembly,transform:{position:port.localPosition??{x:(port.direction?.x??0)*34,y:(port.direction?.y??0)*34},rotation:Math.atan2(port.direction?.y??0,port.direction?.x??1)}});services.assemblyGeometry.rebuildNow();}const snapshot=services.currentAssembly.getSnapshot();return{built:true,nodes:Object.keys(snapshot.nodesById).length,segments:Object.keys(snapshot.nodesById).length-1};},scenarioActions={visualGallery:()=>({cores:getCoreGeometryIds(),modules:MODULE_VISUAL_PROFILES.map(profile=>profile.rendererId),damageStates:["intact","armor-broken","core-disrupted"]}),buildMaximum,buildAsymmetric:()=>({maximum:buildMaximum(),flight:services.flightProfile?.rebuildNow()}),damageSingle:()=>{const node=firstModule();return node?services.moduleDamage.applyDamage(node.nodeId,20,"debug"):null;},bridgeSurvival:()=>{const maximum=buildMaximum();if(!maximum.built)return maximum;const snapshot=services.currentAssembly.getSnapshot(),parent=Object.values(snapshot.nodesById).find(node=>node.nodeId!==snapshot.rootNodeId&&Object.values(snapshot.nodesById).some(child=>child.parentNodeId===node.nodeId));if(!parent)return{survived:false,reason:"no-parent"};const child=Object.values(snapshot.nodesById).find(node=>node.parentNodeId===parent.nodeId);services.currentAssembly.addSecondaryConnection({sourceNodeId:child.nodeId,targetNodeId:snapshot.rootNodeId,profile:{structuralStrength:8,energyThroughput:"standard",visualConnectorType:"debug-bridge"}});services.moduleDamage.applyDamage(parent.nodeId,9999,"debug");return{survived:Boolean(services.currentAssembly.getSnapshot().nodesById[child.nodeId]),childNodeId:child.nodeId};},branchCollapse:()=>{const snapshot=services.currentAssembly?.getSnapshot(),parent=Object.values(snapshot?.nodesById??{}).find(node=>node.nodeId!==snapshot.rootNodeId&&Object.values(snapshot.nodesById).some(child=>child.parentNodeId===node.nodeId))??firstModule();return parent?services.moduleDamage.applyDamage(parent.nodeId,9999,"debug"):null;},repairRemount:()=>({detached:services.currentAssembly?.getSnapshot().detachedItems??[],resources:controller.run?.resources}),setLod:lod=>{metaSave.assemblyVisualPreferences.lod=lod;return lod;},blueprintRoundtrip:()=>{const blueprint=services.blueprints.list()[0];if(!blueprint)return{instruction:"Save a blueprint first."};return validateBlueprint(decodeBlueprint(encodeBlueprint(blueprint)),{knownDefinitionIds:new Set(services.equipment.values().map(item=>item.id)),knownShipFrameIds:new Set(SHIP_FRAME_ASSEMBLY_PROFILES.map(item=>item.id))});}};const scenarioRunner=createAssemblyDebugScenarios(scenarioActions),damage={forceState(nodeId,state){const node=services.currentAssembly.requireNode(nodeId);node.damageState=state;if(state==="armor-broken")node.armorIntegrity=0;if(state==="core-disrupted")node.coreIntegrity=node.maxCoreIntegrity*.3;services.currentAssembly.publishDamageChange(nodeId);return node;}},debugFlags={set:(key,value)=>flags.set(key,value),snapshot:()=>Object.fromEntries(flags)},settings={setTemporary:(key,value)=>{flags.set(key,value);return value;}},blueprints={exportCurrent:()=>{const blueprint=services.blueprints.list()[0];return blueprint?encodeBlueprint(blueprint):null;},importCode:code=>validateBlueprint(decodeBlueprint(code),{knownDefinitionIds:new Set(services.equipment.values().map(item=>item.id)),knownShipFrameIds:new Set(SHIP_FRAME_ASSEMBLY_PROFILES.map(item=>item.id))})};services.assemblyDebug=createAssemblyDebugService({inventory:{grantDebugItem:definitionId=>{const run=controller.run,definition=services.equipment.require(definitionId);if(!run)return null;const item={instanceId:run.ids.create("debug-item"),definitionId:definition.id,ownership:"temporary",rarity:"debug",affixes:[],sockets:[]};run.inventory.push(item);services.events.emit("run-item-acquired",{item,source:"debug"});return item;}},damage,assembly:()=>services.currentAssembly,defaultBridge:{structuralStrength:8,energyThroughput:"standard",visualConnectorType:"debug-bridge"},debugFlags,settings,scenarios:scenarioRunner,blueprints});globalThis.__VOIDREAPER_DEBUG__={...(globalThis.__VOIDREAPER_DEBUG__??{}),assembly:{...services.assemblyDebug,getGeometry:()=>services.assemblyGeometry?.getSnapshot()??null,getHitZones:()=>services.hitZones?.all()??[],getFlightProfile:()=>services.flightProfile?.getProfile()??null,getPending:()=>services.pendingMounts?.values()??[],getQuickMount:()=>services.quickMount?.session??null,getWorkbench:()=>services.assemblyWorkbench?.model()??null,scenarios:scenarioRunner}};}
  const input = createInputController({ eventBus: events, bindings: metaSave.settings.bindings, isQuickMount: () => Boolean(services.quickMount?.session) });
  let quickMountHost=null;const renderQuickMount=()=>{const session=services.quickMount?.session;if(!session||!quickMountHost)return;const suggestion=session.suggestions[session.selectedIndex],definition=services.equipment.require(session.pendingMount.definitionId),overlay=quickMountHost.__overlay;overlay.render({name:definition.name??definition.id,reasons:suggestion.reasons,deltas:[["POSITION",`${session.selectedIndex+1}/${session.suggestions.length}`],["MASSE",suggestion.flightDelta.totalMass?.toFixed?.(1)??"—"],["BALANCE",suggestion.metrics.balance?.toFixed?.(2)??"—"],["ENERGIE",suggestion.metrics.energyPath?.toFixed?.(2)??"—"],["SCHUTZ",suggestion.metrics.protection?.toFixed?.(2)??"—"],["RISIKO",suggestion.metrics.collisionRisk?"HOCH":"NIEDRIG"]],details:[...(definition.tags??[]).map(tag=>typeof tag==="string"?tag:tag.id),`Blueprint ${suggestion.blueprintMatch??"frei"}`]});renderPlacementPreview(overlay.canvas.getContext("2d"),{snapshot:services.assemblyGeometry.getSnapshot(),suggestion,assemblyRenderer:services.assemblyRenderer,time:controller.run?.time??0});};const closeQuickMount=()=>{quickMountHost?.remove();quickMountHost=null;};events.on("run-item-acquired",({item,source})=>{const definition=services.equipment.require(item.definitionId),pending=services.pendingMounts.queue({itemInstance:item,profile:definition.assembly,source,acquiredAt:controller.run?.time??0});if(pending.requiresWorkbench){item.stored=true;legacyRuntime.ui.toast("Großmodul für die Werkbank eingelagert.");return;}const opened=controller.openPendingMount(pending,{moduleProfile:{...definition.assembly,definitionId:definition.id,tags:definition.tags},blueprint:services.blueprints.getActiveId()?services.blueprints.require(services.blueprints.getActiveId()):null,settings:{pauseOnMount:metaSave.settings.pauseOnMount??true}});if(!opened.opened)return;quickMountHost=document.createElement("div");document.body.append(quickMountHost);quickMountHost.__overlay=createQuickMountOverlay(quickMountHost,{onAction:action=>{if(action==="previous")services.quickMount.previous();if(action==="next")services.quickMount.next();if(action==="confirm"){services.quickMount.confirm();closeQuickMount();return;}if(action==="defer"){services.quickMount.defer();closeQuickMount();return;}renderQuickMount();}});renderQuickMount();});
  input.start();
  const inspector = createBuildInspector(document.querySelector("#build-inspector"), services);
  const game = legacyRuntime.game;
  const ui = legacyRuntime.ui;
  legacyRuntime.configureEvolutionEffects((effectId, player) => effects.execute({ id: effectId }, { player, run: controller.run }));
  legacyRuntime.configureShipRenderer((context,player,legacyGame)=>{const geometry=services.assemblyGeometry?.getSnapshot();if(!geometry?.coreGeometry)return false;const rendered=services.assemblyRenderer.renderPlayerShip(context,{geometrySnapshot:geometry,position:player,rotation:player.angle+Math.PI/2,time:legacyGame.time,buildAnimations:services.buildAnimations?.snapshot?.()??[],movement:{x:player.vx,y:player.vy,dodging:player.iframes>0},lodOptions:{userSetting:metaSave.assemblyVisualPreferences?.lod==="auto"?"high":metaSave.assemblyVisualPreferences?.lod}});if(rendered&&player.shield>0){context.strokeStyle="#4f6df5";context.shadowColor="#4f6df5";context.shadowBlur=14;context.lineWidth=1.5;context.beginPath();context.arc(player.x,player.y,player.r+8+Math.sin(legacyGame.time*4)*2,0,Math.PI*2);context.stroke();context.shadowBlur=0;}return rendered;});
  legacyRuntime.configurePlayerDamageRouter((_player,damage)=>{const geometry=services.assemblyGeometry?.getSnapshot(),target=geometry?.nodes.filter(node=>!node.isRoot).sort((a,b)=>Math.hypot(b.worldPosition.x,b.worldPosition.y)-Math.hypot(a.worldPosition.x,a.worldPosition.y))[0];return target&&services.moduleDamage?services.moduleDamage.applyDamage(target.nodeId,damage,"legacy-contact").remainingDamage:damage;});
  const hangarRoot = document.querySelector("#hangar");
  let previewRun;
  let mapScreen;
  let activeCampaignNodeId = null;
  let originalStartWave;
  const showAssemblyWorkbench=()=>{if(!services.assemblyWorkbench||!services.currentAssembly)return legacyRuntime.ui.toast("Werkbank ist nach dem ersten Kampfeinsatz verfügbar.");const stage=hangarRoot.querySelector(".hangar-content"),workbench=services.assemblyWorkbench;workbench.open({source:"sector-map"});let screen;const render=()=>{const model=workbench.model(),geometryById=new Map(model.geometry.nodes.map(node=>[node.nodeId,node])),ports=Object.values(model.assembly.portsById).map(port=>{const parent=geometryById.get(port.parentNodeId),local=port.localPosition??{x:(port.direction?.x??0)*34,y:(port.direction?.y??0)*34};return{...port,position:{x:(parent?.worldPosition.x??0)+local.x,y:(parent?.worldPosition.y??0)+local.y},label:portAccessibilityLabel(port)};});screen.renderInventory(model.inventory.filter(item=>!Object.values(model.assembly.nodesById).some(node=>node.moduleInstanceId===item.instanceId)));screen.renderPorts(ports);renderAssemblyToolbar(stage.querySelector('[data-role="modes"]'),model.session.viewMode,mode=>{workbench.setViewMode(mode);render();});const ctx=screen.canvas.getContext("2d");ctx.clearRect(0,0,screen.canvas.width,screen.canvas.height);ctx.save();ctx.translate(screen.canvas.width/2,screen.canvas.height/2);services.assemblyRenderer.renderPlayerShip(ctx,{geometrySnapshot:model.geometry,position:{x:0,y:0},time:controller.run?.time??0});ctx.restore();const inspector=document.createElement("div"),selected=model.assembly.nodesById[model.session.selectedNodeId],selectedPort=model.assembly.portsById[model.session.selectedPortId];renderAssemblyInspector(inspector,{node:selected,port:selectedPort,warnings:workbench.previewConsequence().warnings});screen.setInspector(inspector);};screen=createAssemblyWorkbenchScreen(stage,{onAction:(action,data)=>{if(action==="close"){workbench.close();showCampaignMap();return;}if(action==="select-item")workbench.selectItem(data.id);if(action==="select-port"){const port=services.currentAssembly.getSnapshot().portsById[data.id];if(!port?.occupiedByNodeId){workbench.selectPort(data.id);if(workbench.session.selectedItemId)workbench.mount({position:port.localPosition??{x:(port.direction?.x??0)*34,y:(port.direction?.y??0)*34},rotation:Math.atan2(port.direction?.y??0,port.direction?.x??1)});}}if(action==="rotate"&&workbench.session.selectedNodeId)workbench.rotate((services.currentAssembly.requireNode(workbench.session.selectedNodeId).localRotation??0)+Math.PI/8);if(action==="move-branch")legacyRuntime.ui.toast("Zielport wählen, um den Ast zu versetzen.");if(action==="dismantle"&&workbench.session.selectedNodeId)workbench.dismantle(false);render();}});render();};
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
    mapScreen = createSectorMapScreen(stage, { onWorkbench: showAssemblyWorkbench, onConfirm: node => {
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
    onResume: checkpoint => { const hydrated = services.checkpoints.hydrate(checkpoint, services); if (!hydrated) return; previewRun = hydrated.run; services.resumeRun=previewRun; showCampaignMap(); },
    renderTab: (tab, content) => {
      if (tab === "Forschung") renderResearchScreen(content, RESEARCH_TREE, { purchased: metaSave.research, canPurchase: node => services.research.canPurchase(metaSave, node), onPurchase: async id => { await services.research.purchase(id); metaSave = await services.save.load(); hangar.render(); } });
      if(tab==="Baupläne")renderBlueprintLibrary(content,{blueprints:services.blueprints.list(),onOpen:id=>legacyRuntime.ui.toast(`Bauplan ${services.blueprints.require(id).name}`),onFavorite:async(id,favorite)=>{await services.save.update(save=>{save.shipBlueprints[id].favorite=favorite;});metaSave=await services.save.load();services.blueprints.hydrate(metaSave);hangar.render();},onCreate:async()=>{if(!services.currentAssembly)return legacyRuntime.ui.toast("Starte zuerst einen Run.");await services.blueprints.saveFromAssembly({name:`${services.currentAssembly.getSnapshot().shipFrameId} Konstruktion`,assemblySnapshot:services.currentAssembly.getSnapshot()});metaSave=await services.save.load();hangar.render();},onImport:()=>{const host=document.createElement("div");content.append(host);createBlueprintImportDialog(host,{validate:blueprint=>validateBlueprint(blueprint,{knownDefinitionIds:new Set(services.equipment.values().map(item=>item.id)),knownShipFrameIds:new Set(SHIP_FRAME_ASSEMBLY_PROFILES.map(item=>item.id))}),onImport:async blueprint=>{await services.blueprints.importBlueprint(blueprint);metaSave=await services.save.load();hangar.render();}}).open();}});
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
