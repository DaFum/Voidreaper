export const selectRealSegments = (state) => {
  // ⚡ Bolt: Avoid intermediate array allocations from Object.values().filter() in selector
  const result = [];
  for (const key in state.nodesById) {
    if (Object.hasOwn(state.nodesById, key)) {
      const node = state.nodesById[key];
      if (node && node.nodeId !== state.rootNodeId && node.moduleInstanceId) {
        result.push(node);
      }
    }
  }
  return result;
};
export const selectFreePorts = (state) => {
  // ⚡ Bolt: Avoid intermediate array allocations from Object.values().filter() in selector
  const result = [];
  for (const key in state.portsById) {
    if (Object.hasOwn(state.portsById, key)) {
      const port = state.portsById[key];
      if (port && !port.occupiedByNodeId && !port.disabled) {
        result.push(port);
      }
    }
  }
  return result;
};
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
