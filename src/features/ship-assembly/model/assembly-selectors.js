// ⚡ Bolt: Cache derived arrays using WeakMap keyed on state objects to preserve
// referential equality across updates. When cache misses, use an imperative for-in loop
// instead of Object.values().filter() to completely eliminate intermediate array allocations.
const segmentsCache = new WeakMap();
export const selectRealSegments = (state) => {
  const cached = segmentsCache.get(state.nodesById);
  // Ensure the cache depends on both the objects and the root node.
  if (cached && cached.rootNodeId === state.rootNodeId) {
    return cached.result;
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

  segmentsCache.set(state.nodesById, { rootNodeId: state.rootNodeId, result });
  return result;
};

// ⚡ Bolt: Cache free ports array to preserve referential equality and use an
// imperative for-in loop on cache misses to prevent Object.values() allocations.
const freePortsCache = new WeakMap();
export const selectFreePorts = (state) => {
  let cached = freePortsCache.get(state.portsById);
  if (cached) return cached;

  const result = [];
  for (const key in state.portsById) {
    if (Object.hasOwn(state.portsById, key)) {
      const port = state.portsById[key];
      if (!port.occupiedByNodeId && !port.disabled) {
        result.push(port);
      }
    }
  }

  freePortsCache.set(state.portsById, result);
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
