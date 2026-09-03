// ⚡ Bolt: Use single-pass imperative for...in loops instead of Object.values().filter()
// to prevent O(N) intermediate array allocations and reduce garbage collection pressure.
export const selectRealSegments = (state) => {
  const segments = [];
  if (state.nodesById) {
    for (const key in state.nodesById) {
      if (Object.hasOwn(state.nodesById, key)) {
        const node = state.nodesById[key];
        if (node.nodeId !== state.rootNodeId && node.moduleInstanceId) {
          segments.push(node);
        }
      }
    }
  }
  return segments;
};
export const selectFreePorts = (state) => {
  const freePorts = [];
  if (state.portsById) {
    for (const key in state.portsById) {
      if (Object.hasOwn(state.portsById, key)) {
        const port = state.portsById[key];
        if (!port.occupiedByNodeId && !port.disabled) {
          freePorts.push(port);
        }
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
