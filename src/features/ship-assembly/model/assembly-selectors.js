const _realSegmentsCache = new WeakMap();
// ⚡ Bolt: Optimize selector by eliminating intermediate arrays from Object.values().filter().
// Uses WeakMap memoization based on nodesById, tracking structuralRevision and rootNodeId
// to properly invalidate when assembly state mutates in-place (e.g., during mount/detach).
// Impact: Eliminates O(N) intermediate array allocations and preserves O(1) equality checks for pure components.
export const selectRealSegments = (state) => {
  let cacheEntry = _realSegmentsCache.get(state.nodesById);
  if (
    cacheEntry &&
    cacheEntry.rootNodeId === state.rootNodeId &&
    cacheEntry.structuralRevision === state.structuralRevision
  ) {
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
  _realSegmentsCache.set(state.nodesById, {
    rootNodeId: state.rootNodeId,
    structuralRevision: state.structuralRevision,
    result,
  });
  return result;
};

const _freePortsCache = new WeakMap();
// ⚡ Bolt: Optimize selector by eliminating intermediate arrays from Object.values().filter().
// Uses WeakMap memoization on portsById, tracking structuralRevision to properly
// invalidate when assembly state mutates in-place.
// Impact: Eliminates O(N) intermediate array allocations and preserves O(1) equality checks for pure components.
export const selectFreePorts = (state) => {
  let cacheEntry = _freePortsCache.get(state.portsById);
  if (
    cacheEntry &&
    cacheEntry.structuralRevision === state.structuralRevision
  ) {
    return cacheEntry.result;
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
  _freePortsCache.set(state.portsById, {
    structuralRevision: state.structuralRevision,
    result,
  });
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
