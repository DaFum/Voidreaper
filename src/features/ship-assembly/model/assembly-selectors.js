const segmentsCache = new WeakMap();
export const selectRealSegments = (state) => {
  if (!state.nodesById) return [];
  const cached = segmentsCache.get(state.nodesById);
  if (
    cached &&
    cached.structuralRevision === state.structuralRevision &&
    cached.rootNodeId === state.rootNodeId
  ) {
    return cached.result;
  }
  const result = Object.values(state.nodesById).filter(
    (node) => node.nodeId !== state.rootNodeId && node.moduleInstanceId,
  );
  segmentsCache.set(state.nodesById, {
    structuralRevision: state.structuralRevision,
    rootNodeId: state.rootNodeId,
    result,
  });
  return result;
};

const freePortsCache = new WeakMap();
export const selectFreePorts = (state) => {
  if (!state.portsById) return [];
  const cached = freePortsCache.get(state.portsById);
  if (cached && cached.structuralRevision === state.structuralRevision) {
    return cached.result;
  }
  const result = Object.values(state.portsById).filter(
    (port) => !port.occupiedByNodeId && !port.disabled,
  );
  freePortsCache.set(state.portsById, {
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
