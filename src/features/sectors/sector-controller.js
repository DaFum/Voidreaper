import { generateSectorMap, flattenSectorMap } from "./sector-map-generator.js";

export function createSectorController({ eventBus, contentVersion = "3.0.0" } = {}) {
  const mapCache = new WeakMap();

  function getNodeById(map, id) {
    if (!map) return undefined;
    let nodeMap = mapCache.get(map);
    if (!nodeMap) {
      nodeMap = new Map(flattenSectorMap(map).map(n => [n.id, n]));
      mapCache.set(map, nodeMap);
    }
    return nodeMap.get(id);
  }

  function reachable(run) {
    if (!run.campaign.currentNodeId) return run.campaign.map.regions[run.campaign.regionIndex].layers[0].map(node => node.id);
    return getNodeById(run.campaign.map, run.campaign.currentNodeId)?.next ?? [];
  }

  return {
    canOpenAssembly(run) { return ["sector-map","workshop","sector-summary"].includes(run.phase); },
    openAssembly(run) { if(!this.canOpenAssembly(run))return false;run.previousPhase=run.phase;run.phase="assembly-workbench";eventBus?.emit("assembly-workbench-opened",{});return true; },
    closeAssembly(run) { if(run.phase!=="assembly-workbench")return false;run.phase=run.previousPhase??"sector-map";delete run.previousPhase;eventBus?.emit("assembly-workbench-closed",{});return true; },
    start(run) { run.campaign.map = generateSectorMap({ seed: run.seed, contentVersion, campaignPathId: run.campaign.pathId ?? "architect" }); run.phase = "sector-map"; return this.model(run); },
    model(run) { return { map: run.campaign.map, regionIndex: run.campaign.regionIndex, currentNodeId: run.campaign.currentNodeId, visitedNodeIds: run.campaign.visitedNodeIds, reachableNodeIds: reachable(run) }; },
    enter(run, nodeId) { const node = getNodeById(run.campaign.map, nodeId); if (!node || !reachable(run).includes(nodeId)) return null; run.phase = node.type; eventBus?.emit("sector-node-entered", { node }); return node; },
    complete(run, nodeId) { if (!run.campaign.visitedNodeIds.includes(nodeId)) run.campaign.visitedNodeIds.push(nodeId); run.campaign.currentNodeId = nodeId; const node = getNodeById(run.campaign.map, nodeId); if (!node?.next.length && run.campaign.regionIndex < 4) { run.campaign.regionIndex += 1; run.campaign.currentNodeId = null; } run.phase = "sector-map"; eventBus?.emit("sector-node-completed", { nodeId }); return this.model(run); }
  };
}
