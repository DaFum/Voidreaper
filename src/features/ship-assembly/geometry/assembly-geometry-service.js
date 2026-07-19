import { ASSEMBLY_EVENTS } from "../assembly-events.js";
import { buildModuleGeometry } from "./module-geometry-builders.js";
import { buildCoreGeometry } from "./core-geometry-builders.js";
import { buildConnectorGeometry } from "./connector-geometry-builder.js";
import { generateAdaptiveArmor } from "./adaptive-armor-generator.js";
import { buildBalanceDecorators } from "./balance-decorator.js";
import { createGeometryCache, calculateTotalBounds } from "./geometry-cache.js";
import { buildPreviewBounds } from "./hit-shape-preview.js";
import { add, rotate } from "./vector-math.js";
import { enforceAssemblyBudget } from "../performance/assembly-performance-budget.js";

const freezeList = list => { for (let i = 0; i < list.length; i++) list[i] = Object.freeze(list[i]); return Object.freeze(list); };
export function createAssemblyGeometryService({eventBus,assemblyService,profileRegistry,equipmentRegistry,errorBoundary}){
  const cache=createGeometryCache();
  let scheduled=false,pendingSnapshot=null;
  // A save/blueprint can reference a module id that a later content update
  // removed or renamed. Resolve profiles without throwing so one stale node
  // falls back to a placeholder instead of aborting the whole rebuild (which
  // would poison cache.revision and blank the entire ship for the run).
  const profileFor=node=>equipmentRegistry?.getAssemblyProfile?.(node.definitionId)??profileRegistry?.getModuleProfile(node.visualProfileId)??{rendererId:node.visualProfileId,sizeClass:node.sizeClass};
  const snapshotFromCache = () => {
    // ⚡ Bolt: Pre-allocate arrays to avoid dynamic resizing overhead in V8
    const nodes = new Array(cache.nodeGeometry.size);
    let nodeIdx = 0;
    for (const node of cache.nodeGeometry.values()) {
      nodes[nodeIdx++] = node;
    }

    const connections = new Array(cache.connectionGeometry.size);
    let connIdx = 0;
    for (const conn of cache.connectionGeometry.values()) {
      connections[connIdx++] = conn;
    }

    const armor = [];
    for (const armors of cache.armorGeometry.values()) {
      for (const a of armors) {
        armor.push(a);
      }
    }

    // Since all elements are already frozen, we can use Object.freeze directly
    // and avoid the intermediate array allocations caused by freezeList (.map()).
    return Object.freeze(enforceAssemblyBudget({
      revision: cache.revision,
      structuralKey: cache.structuralKey,
      shipFrameId: cache.shipFrameId,
      coreGeometry: cache.coreGeometry,
      shipStyle: cache.shipStyle,
      nodes: Object.freeze(nodes),
      connections: Object.freeze(connections),
      armor: Object.freeze(armor),
      decorators: Object.freeze(cache.decorators),
      occupiedBounds: Object.freeze(cache.occupiedBounds),
      totalBounds: cache.totalBounds || null,
      previewBounds: buildPreviewBounds
    }));
  };
  let lastCompleteSnapshot=snapshotFromCache();
  function rebuild(snapshot){if(!snapshot)return getSnapshot();if(cache.revision===snapshot.structuralRevision){for(const node of Object.values(snapshot.nodesById)){const cached=cache.nodeGeometry.get(node.nodeId);if(cached&&(cached.damageState!==node.damageState||cached.armorIntegrity!==node.armorIntegrity||cached.coreIntegrity!==node.coreIntegrity))cache.nodeGeometry.set(node.nodeId,Object.freeze({...cached,damageState:node.damageState,armorIntegrity:node.armorIntegrity,coreIntegrity:node.coreIntegrity}));}lastCompleteSnapshot=snapshotFromCache();return getSnapshot();}const frame=profileRegistry.getShipFrame(snapshot.shipFrameId);if(!frame)throw new Error(`Unknown ship frame geometry: ${snapshot.shipFrameId}`);cache.shipFrameId=snapshot.shipFrameId;cache.shipStyle=frame.style;cache.coreGeometry=buildCoreGeometry(frame.coreGeometryId);cache.nodeGeometry.clear();cache.connectionGeometry.clear();cache.armorGeometry.clear();const root=snapshot.nodesById[snapshot.rootNodeId];if(!root)throw new Error(`Assembly root node is missing: ${snapshot.rootNodeId}`);cache.nodeGeometry.set(root.nodeId,Object.freeze({...root,worldPosition:{x:0,y:0},worldRotation:0,visualMass:root.mass??24,isRoot:true,geometry:cache.coreGeometry}));
    const pending=Object.values(snapshot.nodesById).filter(node=>node.nodeId!==snapshot.rootNodeId);let guard=0;while(pending.length&&guard++<32){for(let index=pending.length-1;index>=0;index--){const node=pending[index],parent=cache.nodeGeometry.get(node.parentNodeId);if(!parent)continue;const worldRotation=parent.worldRotation+(node.localRotation??0),worldPosition=add(parent.worldPosition,rotate(node.localPosition??{x:0,y:0},parent.worldRotation));const resolved={...node,worldPosition,worldRotation,visualMass:node.mass??4,profile:profileFor(node)};resolved.geometry=buildModuleGeometry(resolved,resolved.profile);cache.nodeGeometry.set(node.nodeId,Object.freeze(resolved));pending.splice(index,1);}}
    if(pending.length)console.warn("Assembly geometry skipped orphaned nodes",pending.map(node=>({nodeId:node.nodeId,parentNodeId:node.parentNodeId})));
    for(const connection of Object.values(snapshot.connectionsById)){const source=cache.nodeGeometry.get(connection.sourceNodeId),target=cache.nodeGeometry.get(connection.targetNodeId);if(!source||!target)continue;const geometry=buildConnectorGeometry({id:connection.connectionId,sourceNodeId:connection.sourceNodeId,targetNodeId:connection.targetNodeId,from:source.worldPosition,to:target.worldPosition,loadClass:connection.structuralStrength,energyClass:connection.energyThroughput,style:frame.style.connectorFamily});cache.connectionGeometry.set(connection.connectionId,geometry);cache.armorGeometry.set(connection.connectionId,freezeList(generateAdaptiveArmor(geometry,frame.style)));}
    // ⚡ Bolt: Avoid intermediate arrays from filter/map/spread. Use a single pass loop.
    cache.occupiedBounds = [Object.freeze({ ownerId: root.nodeId, ...cache.coreGeometry.bounds })];
    const decoratorNodes = [];
    for (const node of cache.nodeGeometry.values()) {
      if (!node.isRoot) {
        cache.occupiedBounds.push(Object.freeze(node.geometry.bounds));
        decoratorNodes.push(node);
      }
    }
    cache.totalBounds = Object.freeze(calculateTotalBounds(cache.occupiedBounds));
    cache.decorators = buildBalanceDecorators({ nodes: decoratorNodes, shipStyle: frame.style });
    cache.revision = snapshot.structuralRevision;
    cache.structuralKey = {};
    lastCompleteSnapshot = snapshotFromCache();
    eventBus?.emit(ASSEMBLY_EVENTS.GEOMETRY_READY, lastCompleteSnapshot);
    return lastCompleteSnapshot;
  }
  function getSnapshot(){return lastCompleteSnapshot;}
  const guardedRebuild=snapshot=>errorBoundary?.guard(()=>rebuild(snapshot),{feature:"assembly-geometry",revision:snapshot?.structuralRevision},()=>{cache.revision=Number.NaN;return getSnapshot();})??rebuild(snapshot),requestFrame=globalThis.requestAnimationFrame??(callback=>setTimeout(callback,0)),cancelFrame=globalThis.cancelAnimationFrame??clearTimeout;let scheduledFrame=null;const scheduleRebuild=snapshot=>{pendingSnapshot=snapshot;if(scheduled)return;scheduled=true;scheduledFrame=requestFrame(()=>{scheduled=false;scheduledFrame=null;const next=pendingSnapshot;pendingSnapshot=null;guardedRebuild(next);});},unsubscribe=eventBus?.on(ASSEMBLY_EVENTS.CHANGED,scheduleRebuild);return{rebuildNow:()=>{pendingSnapshot=null;return guardedRebuild(assemblyService.getSnapshot());},getSnapshot,previewBounds:buildPreviewBounds,canCreateEmergencyBrace:nodeId=>{const node=cache.nodeGeometry.get(nodeId);return Boolean(node&&node.worldPosition.x * node.worldPosition.x + node.worldPosition.y * node.worldPosition.y<19600);},measurePlacement:(port,profile)=>{const candidate=buildPreviewBounds(profile,port),center=candidate.center,distance=Math.sqrt(center.x * center.x + center.y * center.y),balance=1-Math.min(1,Math.abs(center.x)/180),clearance=cache.occupiedBounds.length?Math.min(...cache.occupiedBounds.map(b=>Math.sqrt((center.x - (b.minX + b.maxX) / 2) ** 2 + (center.y - (b.minY + b.maxY) / 2) ** 2))):100;return{functionalPosition:1/(1+distance/140),mountQuality:profile.mountTypes?.includes(port.mountType)?1:.4,balance,energyPath:port.energyClass===profile.energyClass?1:.65,protection:Math.max(.15,1-distance/240),fireLane:port.direction?.y < 0 ? 0.9 : 0.55,blueprintMatch:0,collisionRisk:clearance<24?1:0,branchPenalty:(port.branchDepth??0)/4,newPorts:profile.childPorts?.length??0,clearance};},explainPlacement:metrics=>Object.entries(metrics).map(([key,value])=>`${key}: ${Number(value).toFixed(2)}`),destroy:()=>{unsubscribe?.();if(scheduledFrame!=null)cancelFrame(scheduledFrame);scheduledFrame=null;scheduled=false;pendingSnapshot=null;}};
}
