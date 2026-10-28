// ⚡ Bolt: Cache selectors manually using WeakMap and structuralRevision.
// State objects (like nodesById or portsById) are mutated in-place by services
// rather than being replaced immutably, so identity checks aren't enough.
// We must also compare structuralRevision to detect changes.
const segmentsCache = new WeakMap();
const portsCache = new WeakMap();

export const selectRealSegments = (state) => {
  if (!state || !state.nodesById) return [];

  const cached = segmentsCache.get(state);
  if (cached && cached.structuralRevision === state.structuralRevision) {
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

  segmentsCache.set(state, {
    structuralRevision: state.structuralRevision,
    result,
  });

  return result;
};

export const selectFreePorts = (state) => {
  if (!state || !state.portsById) return [];

  const cached = portsCache.get(state);
  if (cached && cached.structuralRevision === state.structuralRevision) {
    return cached.result;
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

  portsCache.set(state, {
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
