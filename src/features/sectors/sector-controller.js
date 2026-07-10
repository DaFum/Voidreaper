import { generateSectorMap, flattenSectorMap } from "./sector-map-generator.js";

export function createSectorController({ eventBus, contentVersion = "3.0.0" } = {}) {
  function reachable(run) {
    const nodes = flattenSectorMap(run.campaign.map);
    if (!run.campaign.currentNodeId) return run.campaign.map.regions[run.campaign.regionIndex].layers[0].map(node => node.id);
    return nodes.find(node => node.id === run.campaign.currentNodeId)?.next ?? [];
  }
  return {
    start(run) { run.campaign.map = generateSectorMap({ seed: run.seed, contentVersion }); run.phase = "sector-map"; return this.model(run); },
    model(run) { return { map: run.campaign.map, regionIndex: run.campaign.regionIndex, currentNodeId: run.campaign.currentNodeId, visitedNodeIds: run.campaign.visitedNodeIds, reachableNodeIds: reachable(run) }; },
    enter(run, nodeId) { const node = flattenSectorMap(run.campaign.map).find(candidate => candidate.id === nodeId); if (!node || !reachable(run).includes(nodeId)) return null; run.phase = node.type; eventBus?.emit("sector-node-entered", { node }); return node; },
    complete(run, nodeId) { if (!run.campaign.visitedNodeIds.includes(nodeId)) run.campaign.visitedNodeIds.push(nodeId); run.campaign.currentNodeId = nodeId; const node = flattenSectorMap(run.campaign.map).find(candidate => candidate.id === nodeId); if (!node?.next.length && run.campaign.regionIndex < 4) { run.campaign.regionIndex += 1; run.campaign.currentNodeId = null; } run.phase = "sector-map"; eventBus?.emit("sector-node-completed", { nodeId }); return this.model(run); }
  };
}
