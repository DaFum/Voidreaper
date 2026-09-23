export function findSurvivingSecondaryConnection(snapshot, childNodeId) {
  // ⚡ Bolt: Use a for-in loop instead of Object.values().find() to eliminate
  // intermediate array allocations and allow early exit.
  const connections = snapshot.secondaryConnectionsById;
  for (const key in connections) {
    if (Object.hasOwn(connections, key)) {
      const connection = connections[key];
      const touches =
        connection.sourceNodeId === childNodeId ||
        connection.targetNodeId === childNodeId;

      if (touches) {
        const other =
          connection.sourceNodeId === childNodeId
            ? connection.targetNodeId
            : connection.sourceNodeId;

        if (snapshot.nodesById[other]) {
          return connection;
        }
      }
    }
  }
  return null;
}
export function createBranchFailureService({
  assemblyService,
  geometryService,
}) {
  return {
    resolveNodeLoss(nodeId) {
      const initial = assemblyService.getSnapshot();

      // ⚡ Bolt: Avoid intermediate array allocations from Object.values(), .filter(), and .map()
      // in the hot path of damage resolution by using a single-pass imperative loop.
      const childIds = [];
      for (const key in initial.nodesById) {
        if (Object.hasOwn(initial.nodesById, key)) {
          const node = initial.nodesById[key];
          if (node.parentNodeId === nodeId) {
            childIds.push(node.nodeId);
          }
        }
      }

      for (const childNodeId of childIds) {
        const live = assemblyService.getSnapshot();
        if (!live.nodesById[childNodeId]) continue;
        const bridge = findSurvivingSecondaryConnection(live, childNodeId);
        if (bridge) {
          const otherNodeId =
            bridge.sourceNodeId === childNodeId
              ? bridge.targetNodeId
              : bridge.sourceNodeId;
          if (live.nodesById[otherNodeId]) {
            assemblyService.promoteSecondaryConnection(
              childNodeId,
              bridge.connectionId,
            );
            assemblyService.applyBranchPenalty(
              childNodeId,
              "secondary-support",
            );
            continue;
          }
        }
        if (geometryService?.canCreateEmergencyBrace?.(childNodeId)) {
          assemblyService.createEmergencyBrace(childNodeId);
          assemblyService.applyBranchPenalty(childNodeId, "emergency-brace");
          continue;
        }
        assemblyService.detachNode({ nodeId: childNodeId, detachBranch: true });
      }
      assemblyService.detachNode({ nodeId, detachBranch: false });
    },
  };
}
