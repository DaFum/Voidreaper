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
      run = createRunState({ seed: game.seed, mode: game.mode === "daily" ? "daily" : "campaign" });
      if (run.mode === "daily" && services.daily) services.daily.apply(run, services.daily.config());
      run.services = services;
      run.heat = createHeatState();
      run.corruption = createCorruptionState(game.corruption ?? 0);
      services.sectors?.start(run);
      services.energy.initialize(run.player, { capacity: 100, reserved: 92, regeneration: 12 });
      const shipFrameId = "vesper";
      const frame = services.assemblyProfiles.getShipFrame(shipFrameId);
      const rootNodeId = run.ids.create("assembly-root");
      const rootNode = { nodeId: rootNodeId, parentNodeId: null, moduleInstanceId: null, definitionId: shipFrameId, visualProfileId: frame.coreGeometryId, localPosition: { x: 0, y: 0 }, localRotation: 0, mass: 24, damageState: "intact", childPortIds: [] };
      const rootPorts = frame.initialPorts.map(template => { const portId=run.ids.create("assembly-port"); rootNode.childPortIds.push(portId); return { ...template, portId, parentNodeId: rootNodeId, occupiedByNodeId: null, localPosition: { x: template.direction.x*46, y: template.direction.y*46 } }; });
      run.assembly = createAssemblyState({ shipFrameId, rootNode, rootPorts });
      const runInventory={values:()=>run.inventory,store:id=>{const item=run.inventory.find(entry=>entry.instanceId===id);if(item)item.stored=true;return item??null;},addPending:entry=>{run.pendingAssemblyItems.push(structuredClone(entry));return entry;},updatePending:(id,patch)=>{const entry=run.pendingAssemblyItems.find(item=>item.pendingMountId===id);if(entry)Object.assign(entry,patch);return entry??null;},pending:()=>run.pendingAssemblyItems};
      services.currentAssembly = createAssemblyService({ state: run.assembly, eventBus: services.events, idFactory: run.ids, runInventory });
      services.assemblyGeometry?.destroy?.();
      services.assemblyGeometry = createAssemblyGeometryService({ eventBus: services.events, assemblyService: services.currentAssembly, profileRegistry: services.assemblyProfiles, equipmentRegistry: services.equipment });
      const railDefinition = services.equipment.require("railgun");
      const railItem = { instanceId: run.ids.create("item"), definitionId: railDefinition.id, ownership: "temporary", rarity: "common", itemPower: 100, affixes: [], sockets: [] };
      run.inventory.push(railItem);
      const startPort = rootPorts.find(port => railDefinition.assembly.mountTypes.includes(port.mountType) && !port.occupiedByNodeId);
      if (startPort) services.currentAssembly.mountModule({ moduleInstanceId: railItem.instanceId, definitionId: railDefinition.id, parentPort: startPort, assemblyProfile: railDefinition.assembly, transform: { position: startPort.localPosition, rotation: Math.atan2(startPort.direction.y,startPort.direction.x) } });
      services.assemblyGeometry.rebuildNow();
      const equipmentService={requireInstance:id=>{const item=run.inventory.find(entry=>entry.instanceId===id);if(!item)throw new Error(`Unknown run item: ${id}`);return item;},requireAssemblyProfile:id=>services.equipment.requireAssemblyProfile(id)};
      const compatibilityService=createCompatibilityService({profileRegistry:services.assemblyProfiles}),stateMachine=createStateMachine("run",services.events),pendingMountService=createPendingMountService({runInventory}),commandService=createAssemblyCommandService({assemblyService:services.currentAssembly,compatibilityService,geometryService:services.assemblyGeometry,equipmentService,onError:message=>globalThis.__VOIDREAPER_TOAST__?.(message)}),suggestionService=createPlacementSuggestionService({compatibilityService,geometryService:services.assemblyGeometry,flightProfileService:{previewPlacement:()=>({lateralImbalance:0})}});
      services.buildAnimations=createBuildAnimationController({reducedMotion:globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches});services.pendingMounts=pendingMountService;services.assemblyCommands=commandService;services.quickMount=createQuickMountController({suggestionService,commandService,pendingMountService,runInventory,assemblyService:services.currentAssembly,stateMachine,timeScaleService:{push:(_id,scale)=>{game.timeScale=scale;},pop:()=>{game.timeScale=1;}}});services.assemblyWorkbench=createConstructionWorkbenchController({commandService,assemblyService:services.currentAssembly,geometryService:services.assemblyGeometry,runInventory,stateMachine});
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
