import { createRunState } from "../runtime/create-run-state.js";
import { createHeatState } from "../features/heat/heat-system.js";
import { createCorruptionState } from "../features/corruption/corruption-system.js";
import { createAssemblyState } from "../features/ship-assembly/model/create-assembly-state.js";
import { createAssemblyService } from "../features/ship-assembly/model/assembly-service.js";
import { createAssemblyGeometryService } from "../features/ship-assembly/geometry/assembly-geometry-service.js";
import { createCompatibilityService } from "../features/ship-assembly/placement/compatibility-service.js";
import { createPlacementSuggestionService } from "../features/ship-assembly/placement/placement-suggestion-service.js";
import { createPendingMountService } from "../features/ship-assembly/mounting/pending-mount-service.js";
import { createAssemblyCommandService } from "../features/ship-assembly/mounting/assembly-command-service.js";
import { createQuickMountController } from "../features/ship-assembly/mounting/quick-mount-controller.js";
import { createConstructionWorkbenchController } from "../features/ship-assembly/mounting/construction-workbench-controller.js";
import { createBuildAnimationController } from "../features/ship-assembly/mounting/build-animation-controller.js";
import { createStateMachine } from "./state-machine.js";
import { createCoreExposureService } from "../features/ship-assembly/placement/core-exposure-service.js";
import { createEquipmentService } from "../features/equipment/equipment-service.js";
import { createBranchFailureService } from "../features/ship-assembly/damage/branch-failure-service.js";
import { createModuleDamageService } from "../features/ship-assembly/damage/module-damage-service.js";
import { createModuleFaultAdapter } from "../features/ship-assembly/damage/module-fault-adapter.js";
import { buildAssemblyHitZones } from "../features/ship-assembly/damage/hit-zone-builder.js";
import { createHitZoneIndex } from "../features/ship-assembly/damage/hit-zone-index.js";
import { createDamageRouter } from "../features/ship-assembly/damage/damage-router.js";
import { createCollisionSystem } from "../features/combat/collision-system.js";
import { createRepairService } from "../features/ship-assembly/damage/repair-service.js";
import { createFlightProfileService } from "../features/ship-assembly/flight/flight-profile-service.js";
import { createFlightProfileSmoother } from "../features/ship-assembly/flight/flight-profile-smoother.js";
import { createRecoilService } from "../features/ship-assembly/flight/recoil-service.js";
import { createCameraFitService } from "../features/ship-assembly/flight/camera-fit-service.js";

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
    openPendingMount(pendingMount, context) { return services.quickMount?.open(pendingMount, context) ?? { opened:false, reason:"quick-mount-unavailable" }; },
    attachLegacy(game) {
      const resumed=services.resumeRun??null;delete services.resumeRun;run = resumed??createRunState({ seed: game.seed, mode: game.mode === "daily" ? "daily" : "campaign" });
      if (!resumed&&run.mode === "daily" && services.daily) services.daily.apply(run, services.daily.config());
      run.services = services;
      run.heat ??= createHeatState();
      run.corruption ??= createCorruptionState(game.corruption ?? 0);
      if(!resumed)services.sectors?.start(run);
      if(!resumed)services.energy.initialize(run.player, { capacity: 100, reserved: 92, regeneration: 12 });
      const shipFrameId = run.assembly?.shipFrameId??"vesper";
      const frame = services.assemblyProfiles.getShipFrame(shipFrameId);
      let rootPorts=[];if(!run.assembly){const rootNodeId = run.ids.create("assembly-root"),rootNode = { nodeId: rootNodeId, parentNodeId: null, moduleInstanceId: null, definitionId: shipFrameId, visualProfileId: frame.coreGeometryId, localPosition: { x: 0, y: 0 }, localRotation: 0, mass: 24, damageState: "intact", childPortIds: [] };rootPorts = frame.initialPorts.map(template => { const portId=run.ids.create("assembly-port"); rootNode.childPortIds.push(portId); return { ...template, portId, parentNodeId: rootNodeId, occupiedByNodeId: null, localPosition: { x: template.direction.x*46, y: template.direction.y*46 } }; });run.assembly = createAssemblyState({ shipFrameId, rootNode, rootPorts });run.activeBlueprintId=services.blueprints?.getActiveId?.()??null;run.activeBlueprintVariantId=null;}else rootPorts=Object.values(run.assembly.portsById).filter(port=>port.parentNodeId===run.assembly.rootNodeId);
      const runInventory={values:()=>run.inventory,store:id=>{const item=run.inventory.find(entry=>entry.instanceId===id);if(item)item.stored=true;return item??null;},addPending:entry=>{run.pendingAssemblyItems.push(structuredClone(entry));return entry;},updatePending:(id,patch)=>{const entry=run.pendingAssemblyItems.find(item=>item.pendingMountId===id);if(entry)Object.assign(entry,patch);return entry??null;},pending:()=>run.pendingAssemblyItems};
      services.currentAssembly = createAssemblyService({ state: run.assembly, eventBus: services.events, idFactory: run.ids, runInventory });
      services.assemblyGeometry?.destroy?.();
      services.assemblyGeometry = createAssemblyGeometryService({ eventBus: services.events, assemblyService: services.currentAssembly, profileRegistry: services.assemblyProfiles, equipmentRegistry: services.equipment, errorBoundary: services.assemblyErrors });
      if(!resumed){const railDefinition = services.equipment.require("railgun"),railItem = { instanceId: run.ids.create("item"), definitionId: railDefinition.id, ownership: "temporary", rarity: "common", itemPower: 100, affixes: [], sockets: [] };run.inventory.push(railItem);const startPort = rootPorts.find(port => railDefinition.assembly.mountTypes.includes(port.mountType) && !port.occupiedByNodeId);if (startPort) services.currentAssembly.mountModule({ moduleInstanceId: railItem.instanceId, definitionId: railDefinition.id, parentPort: startPort, assemblyProfile: railDefinition.assembly, transform: { position: startPort.localPosition, rotation: Math.atan2(startPort.direction.y,startPort.direction.x) } });}
      services.assemblyGeometry.rebuildNow();
      services.buildAnimations=createBuildAnimationController({reducedMotion:globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches});
      const equipmentService=createEquipmentService({registry:services.equipment,inventory:()=>run.inventory}),coreExposureService=createCoreExposureService(),compatibilityService=createCompatibilityService({profileRegistry:services.assemblyProfiles,coreExposureService}),stateMachine=createStateMachine("run",services.events),pendingMountService=createPendingMountService({runInventory}),commandService=createAssemblyCommandService({assemblyService:services.currentAssembly,compatibilityService,geometryService:services.assemblyGeometry,equipmentService,buildAnimationController:services.buildAnimations,onError:message=>globalThis.__VOIDREAPER_TOAST__?.(message)});
      services.flightProfile?.destroy?.();services.flightProfile=createFlightProfileService({eventBus:services.events,geometryService:services.assemblyGeometry});services.flightProfile.rebuildNow();const suggestionService=createPlacementSuggestionService({compatibilityService,geometryService:services.assemblyGeometry,flightProfileService:services.flightProfile});
      const branchFailureService=createBranchFailureService({assemblyService:services.currentAssembly,geometryService:services.assemblyGeometry});services.moduleDamage=createModuleDamageService({assemblyService:services.currentAssembly,eventBus:services.events,branchFailureService});services.moduleFaults?.destroy?.();services.moduleFaults=createModuleFaultAdapter({assemblyService:services.currentAssembly,equipmentService,eventBus:services.events});services.moduleFaults.refresh();services.hitZones=createHitZoneIndex();const refreshHitZones=geometry=>services.hitZones.rebuild(geometry.revision,buildAssemblyHitZones(geometry,frame));refreshHitZones(services.assemblyGeometry.getSnapshot());services.geometryReadyUnsubscribe?.();services.geometryReadyUnsubscribe=services.events.on("assembly:geometry-ready",refreshHitZones);services.damageRouter=createDamageRouter({moduleDamageService:services.moduleDamage,playerDamageService:{applyHullDamage:amount=>{run.player.hull=Math.max(0,run.player.hull-amount);}}});services.assemblyCollision=createCollisionSystem({hitZoneIndex:services.hitZones,damageRouter:services.damageRouter});services.repairs=createRepairService({assemblyService:services.currentAssembly,resources:run.resources,eventBus:services.events,remountDetached:item=>pendingMountService.queue({itemInstance:item,profile:services.equipment.requireAssemblyProfile(item.definitionId),source:"repair",acquiredAt:run.time})});services.recoil=createRecoilService({flightProfileService:services.flightProfile});services.flightSmoother=createFlightProfileSmoother(services.flightProfile.getProfile());services.flightProfileUnsubscribe?.();services.flightProfileUnsubscribe=services.events.on("assembly:flight-profile-changed",profile=>services.flightSmoother.setTarget(profile));services.cameraFit=createCameraFitService({camera:run.camera,viewport:()=>({width:innerWidth,height:innerHeight})});services.cameraFit.fit(services.assemblyGeometry.getSnapshot().totalBounds);
      services.pendingMounts=pendingMountService;services.assemblyCommands=commandService;services.quickMount=createQuickMountController({suggestionService,commandService,pendingMountService,runInventory,assemblyService:services.currentAssembly,stateMachine,timeScaleService:{push:(_id,scale)=>{game.timeScale=scale;},pop:()=>{game.timeScale=1;}}});services.assemblyWorkbench=createConstructionWorkbenchController({commandService,assemblyService:services.currentAssembly,geometryService:services.assemblyGeometry,runInventory,stateMachine});
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
      services.buildAnimations?.update(dt);
      run.player.flightProfile=services.flightSmoother?.update(dt)??services.flightProfile?.getProfile();
      services.cameraFit?.update(dt,run.player);
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
      const distance=120*(run.player.flightProfile?.dodgeDistanceMultiplier??1);game.player.x += direction.x * distance;
      game.player.y += direction.y * distance;
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
