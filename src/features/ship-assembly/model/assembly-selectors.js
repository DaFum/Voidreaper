// ⚡ Bolt: Avoid Object.values().filter() to eliminate intermediate array allocations
export const selectRealSegments = (state) => {
  const segments = [];
  for (const key in state.nodesById) {
    if (Object.hasOwn(state.nodesById, key)) {
      const node = state.nodesById[key];
      if (node.nodeId !== state.rootNodeId && node.moduleInstanceId) {
        segments.push(node);
      }
    }
  }
  return segments;
};

// ⚡ Bolt: Avoid Object.values().filter() to eliminate intermediate array allocations
export const selectFreePorts = (state) => {
  const freePorts = [];
  for (const key in state.portsById) {
    if (Object.hasOwn(state.portsById, key)) {
      const port = state.portsById[key];
      if (!port.occupiedByNodeId && !port.disabled) {
        freePorts.push(port);
      }
    }
  }
  return freePorts;
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
