const _realSegmentsCache = new WeakMap();
// ⚡ Bolt: Optimize selector by eliminating intermediate arrays from Object.values().filter().
// Uses WeakMap memoization based on nodesById and rootNodeId to maintain referential equality
// and prevent downstream UI re-renders unless these specific state parts change.
// Impact: Eliminates O(N) intermediate array allocations and preserves O(1) equality checks for pure components.
export const selectRealSegments = (state) => {
  let cacheEntry = _realSegmentsCache.get(state.nodesById);
  if (cacheEntry && cacheEntry.rootNodeId === state.rootNodeId) {
    return cacheEntry.result;
  }
  const result = [];
  for (const key in state.nodesById) {
    if (Object.hasOwn(state.nodesById, key)) {
      const node = state.nodesById[key];
      if (node.nodeId !== state.rootNodeId && node.moduleInstanceId) {
        result.push(node);
      }
    }
  }
  _realSegmentsCache.set(state.nodesById, { rootNodeId: state.rootNodeId, result });
  return result;
};

const _freePortsCache = new WeakMap();
// ⚡ Bolt: Optimize selector by eliminating intermediate arrays from Object.values().filter().
// Uses WeakMap memoization on portsById to maintain referential equality and prevent UI re-renders.
// Impact: Eliminates O(N) intermediate array allocations and preserves O(1) equality checks for pure components.
export const selectFreePorts = (state) => {
  if (_freePortsCache.has(state.portsById)) {
    return _freePortsCache.get(state.portsById);
  }
  const result = [];
  for (const key in state.portsById) {
    if (Object.hasOwn(state.portsById, key)) {
      const port = state.portsById[key];
      if (!port.occupiedByNodeId && !port.disabled) {
        result.push(port);
      }
    }
  }
  _freePortsCache.set(state.portsById, result);
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
