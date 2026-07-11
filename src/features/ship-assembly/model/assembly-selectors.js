export const selectRealSegments = state => Object.values(state.nodesById).filter(node => node.nodeId !== state.rootNodeId && node.moduleInstanceId);
export const selectFreePorts = state => Object.values(state.portsById).filter(port => !port.occupiedByNodeId && !port.disabled);
export const selectModuleOwner = (state, moduleInstanceId) => {
  if (state.nodeIdByModuleInstanceId) {
    const nodeId = state.nodeIdByModuleInstanceId[moduleInstanceId];
    return nodeId ? state.nodesById[nodeId] ?? null : null;
  }
  return Object.values(state.nodesById).find(node => node.moduleInstanceId === moduleInstanceId) ?? null;
};
