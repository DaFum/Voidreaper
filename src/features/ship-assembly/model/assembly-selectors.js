export const selectRealSegments = (state) =>
  Object.values(state.nodesById).filter(
    (node) => node.nodeId !== state.rootNodeId && node.moduleInstanceId,
  );
export const selectFreePorts = (state) =>
  Object.values(state.portsById).filter(
    (port) => !port.occupiedByNodeId && !port.disabled,
  );
export const selectModuleOwner = (state, moduleInstanceId) => {
  if (!moduleInstanceId) return null;
  if (state.nodeIdByModuleInstanceId) {
    const nodeId = state.nodeIdByModuleInstanceId[moduleInstanceId];
    return nodeId ? (state.nodesById[nodeId] ?? null) : null;
  }
  // Performance optimization: Use a for-in loop over state.nodesById instead of
  // Object.values().find() to eliminate intermediate array allocations and allow early exit.
  if (state.nodesById) {
    for (const key in state.nodesById) {
      if (Object.hasOwn(state.nodesById, key)) {
        const node = state.nodesById[key];
        if (node && node.moduleInstanceId === moduleInstanceId) {
          return node;
        }
      }
    }
  }
  return null;
};
