export const selectRealSegments = state => Object.values(state.nodesById).filter(node => node.nodeId !== state.rootNodeId && node.moduleInstanceId);
export const selectFreePorts = state => Object.values(state.portsById).filter(port => !port.occupiedByNodeId && !port.disabled);
export const selectModuleOwner = (state, moduleInstanceId) => Object.values(state.nodesById).find(node => node.moduleInstanceId === moduleInstanceId) ?? null;
